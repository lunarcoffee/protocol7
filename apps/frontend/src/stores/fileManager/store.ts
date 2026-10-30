import { produce } from 'immer';
import { createStore } from 'zustand/vanilla';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';
import { reduceItemStates } from '@/hooks/useDragSelectReducer';
import { keyToCompareFn } from '@/utils/keyToCompareFn';

import type { ProcessInfo, ProcessSettings } from '../system/processes/ProcessManager';
import type { ItemStates, UpdateItemStatesAction } from '@/components/shell/controls/DragSelectContainer';
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
    setCwd: (path: string) => Promise<void>;

    cwdEntries?: FsEntryMetadata[];
    refresh: (restartSearch?: boolean) => Promise<void>;

    cwdBack: () => Promise<void>;
    cwdForward: () => Promise<void>;
    canCwdBack: () => boolean;
    canCwdForward: () => boolean;

    // the behavior of some of the store functions changes depending on whether `searchQuery` is empty; if it's not
    // empty, we say we're in search mode. when in search mode, `cwdEntries` contains the current search results (as
    // long as `isDoneSearching` is false, there might be more added later).
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isDoneSearching: boolean;
    searchCwd: () => Promise<void>;

    // key is entry uid
    selectionStates: ItemStates<number>;
    updateSelection: (action: UpdateItemStatesAction<number>) => void;

    settings: ProcessSettings<FileManagerSettings>;
    updateSettings: (updates: Partial<ProcessSettings<FileManagerSettings>>) => Promise<void>;
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

const sortEntries = (entries: FsEntryMetadata[], { sortColumn, isAscending }: ProcessSettings<FileManagerSettings>) => {
    const directories = entries.filter(({ type }) => type === 'directory');
    const files = entries.filter(({ type }) => type === 'file');

    const sortFn = FILE_TABLE_COLUMNS[sortColumn].compareFn(!isAscending);
    directories.sort(sortFn);
    files.sort(sortFn);

    // directories before files, always
    return [...directories, ...files];
};

const readDirectorySorted = async (dirPath: string, settings: ProcessSettings<FileManagerSettings>) => {
    const dir = await readDirectory(dirPath);
    return dir?.ok ? sortEntries(Object.values(dir.entries), settings) : undefined;
};

const makeSelectionStates = (cwdEntries?: FsEntryMetadata[], oldStates?: ItemStates<number>) =>
    new Map(Object.values(cwdEntries ?? []).map(({ uid }) => [uid, !!oldStates?.get(uid)]));

/* the actual store */

export const createFileManagerStore = (pinfo: ProcessInfo): FileManagerStoreAPI => {
    const settings = pinfo.getSettings<FileManagerSettings>();
    const saveSettings = pinfo.saveSettings<FileManagerSettings>;

    let setCwdRequest = 0;
    let refreshRequest = 0;
    let searchRequest = 0;

    return createStore<FileManagerStore>()((set, get) => ({
        backStack: ['/'],
        forwardStack: [],

        cwd: () => get().backStack.at(-1)!,
        setCwd: async (entryPath) => {
            const cwd = normalizePath(entryPath);
            if (get().cwd() === cwd) return;

            setCwdRequest = (setCwdRequest + 1) % 10_000;
            const curRequest = setCwdRequest;

            const result = await readMetadata(cwd);
            if (!result?.ok) return;

            const { type, path } = result.metadata;
            if (curRequest === setCwdRequest && type === 'directory' && path === cwd) {
                set({ backStack: [...get().backStack, cwd], forwardStack: [] });
                await get().refresh();
            }
        },

        // call `refresh` to initialize
        cwdEntries: undefined,
        refresh: async (restartSearch: boolean = true) => {
            refreshRequest = (refreshRequest + 1) % 10_000;
            const curRequest = refreshRequest;

            if (restartSearch && get().searchQuery) return get().searchCwd();

            const cwdEntries = get().searchQuery
                ? sortEntries(get().cwdEntries ?? [], get().settings)
                : await readDirectorySorted(get().cwd(), get().settings);

            if (curRequest === refreshRequest) {
                const selectionStates = makeSelectionStates(cwdEntries, get().selectionStates);
                set({ cwdEntries, selectionStates });
            }
        },

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

        searchQuery: '',
        setSearchQuery: (searchQuery: string) => {
            if (searchQuery === get().searchQuery) return;

            set({ searchQuery });
            if (searchQuery) {
                void get().searchCwd();
            } else {
                searchRequest = (searchRequest + 1) % 10_000;
                set({ isDoneSearching: true });
                void get().refresh();
            }
        },
        isDoneSearching: true,
        searchCwd: async () => {
            searchRequest = (searchRequest + 1) % 10_000;
            const curRequest = ++searchRequest;

            setCwdRequest = (setCwdRequest + 1) % 10_000;
            refreshRequest = (refreshRequest + 1) % 10_000;

            set({ isDoneSearching: false, cwdEntries: [], selectionStates: new Map() });

            const normalizedQuery = get().searchQuery.toLocaleLowerCase();
            const searchDirs = [get().cwd()];
            const results: FsEntryMetadata[] = [];

            while (searchDirs.length > 0) {
                const dir = await readDirectory(searchDirs.pop()!);
                if (curRequest !== searchRequest) return;
                if (!dir?.ok) continue;

                const entries = Object.values(dir.entries);
                searchDirs.push(...entries.filter(({ type }) => type === 'directory').map(({ path }) => path));
                results.push(...entries.filter(({ name }) => name.toLocaleLowerCase().includes(normalizedQuery)));

                const cwdEntries = sortEntries(results, get().settings);
                const selectionStates = makeSelectionStates(cwdEntries, get().selectionStates);
                set({ cwdEntries, selectionStates });
            }

            set({ isDoneSearching: true });
        },

        selectionStates: new Map(),
        updateSelection: (action) =>
            set(({ selectionStates }) => ({ selectionStates: reduceItemStates(selectionStates, action) })),

        settings,
        updateSettings: async (updates) => {
            const settings = { ...get().settings, ...updates };
            set({ settings });

            // the only relevant settings here are the sorting-related ones; we shouldn't restart a search for that
            await get().refresh(false);
            await saveSettings(settings);
        },
    }));
};
