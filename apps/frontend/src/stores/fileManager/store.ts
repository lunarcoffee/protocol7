import { produce } from 'immer';
import { createStore } from 'zustand/vanilla';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';
import { reduceItemStates } from '@/hooks/useDragSelectReducer';
import { keyToCompareFn } from '@/utils/keyToCompareFn';

import type { ProcessInfo, ProcessSettings } from '../system/processes/ProcessManager';
import type { ItemStates, UpdateItemStatesAction } from '@/components/shell/controls/DragSelectContainer';
import type { ReadDirectoryResult } from '@/filesystem/api/readDirectory';
import type { FsEntryMetadata } from '@protocol7/filesystem-types';
import type { StoreApi } from 'zustand/vanilla';

export type SavedLocation = { label: string; icon: string };

export interface FileManagerSettings {
    locations: Map<string, SavedLocation>;
    favorites: string[];

    sortColumn: FileTableColumnName;
    isAscending: boolean;
}

export interface FileManagerStore {
    // invariant: the cwd is the last `backStack` entry
    backStack: string[];
    forwardStack: string[];

    cwd: () => string;
    cwdBack: () => Promise<void>;
    cwdForward: () => Promise<void>;
    canCwdBack: () => boolean;
    canCwdForward: () => boolean;

    dir: ReadDirectoryResult | undefined;

    // key is entry uid
    selectionStates: ItemStates<number>;
    updateSelection: (action: UpdateItemStatesAction<number>) => void;

    settings: ProcessSettings<FileManagerSettings>;
    updateSettings: (updates: Partial<ProcessSettings<FileManagerSettings>>) => Promise<void>;

    refresh: () => Promise<void>;
    setCwd: (path: string) => Promise<void>;
}

export type FileManagerStoreAPI = StoreApi<FileManagerStore>;

/* file table sorting & selection utilities */

const nameCompareFn = keyToCompareFn<FsEntryMetadata>(({ name }) => [name]);
const modifiedCompareFn = keyToCompareFn<FsEntryMetadata>(({ modified }) => [modified]);
const sizeCompareFn = keyToCompareFn<FsEntryMetadata>((metadata) => [metadata.type === 'file' ? metadata.size : 0]);

// mapping columns and the comparison functions they use for ordering entries
export const FILE_TABLE_COLUMNS = {
    ['Name']: { compareFn: nameCompareFn },
    ['Last modified']: { compareFn: modifiedCompareFn },
    ['Size']: { compareFn: sizeCompareFn },
};

export type FileTableColumnName = keyof typeof FILE_TABLE_COLUMNS;

const readDirectorySorted = async (
    dirPath: string,
    { sortColumn, isAscending }: ProcessSettings<FileManagerSettings>,
): Promise<ReadDirectoryResult> => {
    const dir = await readDirectory(dirPath);
    if (!dir?.ok) return dir;

    const dirEntries = Object.values(dir.entries);

    // split directories and files so we can process them separately
    const directories = dirEntries.filter(({ type }) => type === 'directory');
    const files = dirEntries.filter(({ type }) => type === 'file');

    const sortFn = FILE_TABLE_COLUMNS[sortColumn].compareFn(!isAscending);
    directories.sort(sortFn);
    files.sort(sortFn);

    const sortedEntries = [...directories, ...files];
    const entries = Object.fromEntries(sortedEntries.map((entry) => [entry.path, entry]));
    return { ...dir, entries };
};

const makeSelectionStates = (dir: ReadDirectoryResult, oldStates?: ItemStates<number>) =>
    new Map(Object.values(dir.ok ? dir.entries : []).map(({ uid }) => [uid, !!oldStates?.get(uid)]));

/* the actual store */

export const createFileManagerStore = (pinfo: ProcessInfo): FileManagerStoreAPI => {
    const settings = pinfo.getSettings<FileManagerSettings>();
    const saveSettings = pinfo.saveSettings<FileManagerSettings>;

    let refreshRequest = 0;
    let setCwdRequest = 0;

    return createStore<FileManagerStore>()((set, get) => ({
        backStack: ['/'],
        forwardStack: [],

        cwd: () => get().backStack.at(-1)!,
        cwdBack: async () => {
            if (get().canCwdBack()) {
                set(produce(get(), (draft) => void draft.forwardStack.push(draft.backStack.pop()!)));
                await get().refresh();
            }
        },
        cwdForward: async () => {
            if (get().canCwdForward()) {
                set(produce(get(), (draft) => void draft.backStack.push(draft.forwardStack.pop()!)));
                await get().refresh();
            }
        },
        canCwdBack: () => get().backStack.length > 1,
        canCwdForward: () => get().forwardStack.length > 0,

        // call `refresh` to initialize
        dir: undefined,

        selectionStates: new Map(),
        updateSelection: (action) =>
            set(({ selectionStates }) => ({ selectionStates: reduceItemStates(selectionStates, action) })),

        settings,
        updateSettings: async (updates) => {
            const settings = { ...get().settings, ...updates };
            set({ settings });

            await get().refresh();
            await saveSettings(settings);
        },

        refresh: async () => {
            refreshRequest = (refreshRequest + 1) % 10_000;
            const curRequest = refreshRequest;

            const dir = await readDirectorySorted(get().cwd(), get().settings);

            if (curRequest === refreshRequest) {
                const selectionStates = makeSelectionStates(dir, get().selectionStates);
                set({ dir, selectionStates });
            }
        },
        setCwd: async (entryPath) => {
            const cwd = normalizePath(entryPath);
            if (get().cwd() === cwd) return;

            setCwdRequest = (setCwdRequest + 1) % 10_000;
            const curRequest = setCwdRequest;

            const result = await readMetadata(cwd);
            if (!result?.ok) return;

            const { type, path } = result.metadata;
            if (curRequest === setCwdRequest && type === 'directory' && path === cwd) {
                const dir = await readDirectorySorted(cwd, get().settings);
                if (curRequest === setCwdRequest) {
                    set({
                        backStack: [...get().backStack, cwd],
                        forwardStack: [],
                        dir,
                        selectionStates: makeSelectionStates(dir),
                    });
                }
            }
        },
    }));
};
