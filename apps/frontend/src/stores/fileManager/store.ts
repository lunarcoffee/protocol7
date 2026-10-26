import { createStore } from 'zustand/vanilla';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';
import { reduceItemStates } from '@/hooks/useDragSelectReducer';

import type { ItemStates, UpdateItemStatesAction } from '@/components/shell/controls/DragSelectContainer';
import type { ReadDirectoryResult } from '@/filesystem/api/readDirectory';
import type { StoreApi } from 'zustand/vanilla';

export type SavedLocation = { label: string; icon: string };

export interface FileManagerSettings {
    locations: Record<string, SavedLocation>;
    favorites: string[];
}

export interface FileManagerStore {
    cwd: string;
    dir: ReadDirectoryResult | undefined;

    // key is entry uid
    selectionStates: ItemStates<number>;
    updateSelection: (action: UpdateItemStatesAction<number>) => void;

    locations: Map<string, SavedLocation>;
    favorites: string[];

    refresh: () => Promise<void>;
    setCwd: (path: string) => Promise<void>;
}

export type FileManagerStoreAPI = StoreApi<FileManagerStore>;

const makeSelectionStates = (dir: ReadDirectoryResult) =>
    new Map(Object.values(dir.ok ? dir.entries : []).map(({ uid }) => [uid, false]));

export const createFileManagerStore = (settings: FileManagerSettings): FileManagerStoreAPI => {
    let setCwdRequest = 0;

    const locations = new Map(Object.entries(settings.locations));
    const { favorites } = settings;

    return createStore<FileManagerStore>()((set, get) => ({
        cwd: '/',
        dir: undefined,

        selectionStates: new Map(),
        updateSelection: (action) =>
            set(({ selectionStates }) => ({
                selectionStates: reduceItemStates(selectionStates, action),
            })),

        locations,
        favorites,

        refresh: async () => {
            const dir = await readDirectory(get().cwd);
            set({ dir, selectionStates: makeSelectionStates(dir) });
        },
        setCwd: async (entryPath) => {
            const normalizedPath = normalizePath(entryPath);
            if (get().cwd === normalizedPath) return;

            setCwdRequest = (setCwdRequest + 1) % 10_000;
            const curRequest = setCwdRequest;

            const result = await readMetadata(normalizedPath);
            if (!result?.ok) return;

            const { type, path } = result.metadata;
            if (curRequest === setCwdRequest && type === 'directory' && path === normalizedPath) {
                const dir = await readDirectory(normalizedPath);
                if (curRequest === setCwdRequest) {
                    set({ cwd: normalizedPath, dir, selectionStates: makeSelectionStates(dir) });
                }
            }
        },
    }));
};
