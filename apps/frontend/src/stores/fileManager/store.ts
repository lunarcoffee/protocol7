import { type Draft, produce } from 'immer';
import { createStore } from 'zustand/vanilla';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';
import { reduceItemStates } from '@/hooks/useDragSelectReducer';

import type { ProcessInfo, ProcessSettings } from '../system/processes/ProcessManager';
import type { ItemStates, UpdateItemStatesAction } from '@/components/shell/controls/DragSelectContainer';
import type { FileTableColumnName } from '@/components/shell/fileManager/FileTable';
import type { ReadDirectoryResult } from '@/filesystem/api/readDirectory';
import type { StoreApi } from 'zustand/vanilla';

export type SavedLocation = { label: string; icon: string };

export interface FileManagerSettings {
    locations: Map<string, SavedLocation>;
    favorites: string[];

    sortColumn: FileTableColumnName;
    isAscending: boolean;
}

export interface FileManagerStore {
    cwd: string;
    dir: ReadDirectoryResult | undefined;

    // key is entry uid
    selectionStates: ItemStates<number>;
    updateSelection: (action: UpdateItemStatesAction<number>) => void;

    settings: ProcessSettings<FileManagerSettings>;
    updateSettings: (recipe: (draft: Draft<FileManagerSettings>) => void) => Promise<void>;

    refresh: () => Promise<void>;
    setCwd: (path: string) => Promise<void>;
}

export type FileManagerStoreAPI = StoreApi<FileManagerStore>;

const makeSelectionStates = (dir: ReadDirectoryResult) =>
    new Map(Object.values(dir.ok ? dir.entries : []).map(({ uid }) => [uid, false]));

export const createFileManagerStore = (pinfo: ProcessInfo): FileManagerStoreAPI => {
    const settings = pinfo.getSettings<FileManagerSettings>();
    const saveSettings = pinfo.saveSettings<FileManagerSettings>;

    let setCwdRequest = 0;

    return createStore<FileManagerStore>()((set, get) => ({
        cwd: '/',
        dir: undefined,

        selectionStates: new Map(),
        updateSelection: (action) =>
            set(({ selectionStates }) => ({ selectionStates: reduceItemStates(selectionStates, action) })),

        settings,
        updateSettings: async (recipe) => {
            const settings = produce(get().settings, recipe);

            set({ settings });
            await saveSettings(settings);
        },

        refresh: async () => {
            const dir = await readDirectory(get().cwd);
            set({ dir, selectionStates: makeSelectionStates(dir) });
        },
        setCwd: async (entryPath) => {
            const cwd = normalizePath(entryPath);
            if (get().cwd === cwd) return;

            setCwdRequest = (setCwdRequest + 1) % 10_000;
            const curRequest = setCwdRequest;

            const result = await readMetadata(cwd);
            if (!result?.ok) return;

            const { type, path } = result.metadata;
            if (curRequest === setCwdRequest && type === 'directory' && path === cwd) {
                const dir = await readDirectory(cwd);
                if (curRequest === setCwdRequest) set({ cwd, dir, selectionStates: makeSelectionStates(dir) });
            }
        },
    }));
};
