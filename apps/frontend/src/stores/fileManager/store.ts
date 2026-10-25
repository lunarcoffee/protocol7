import { createStore } from 'zustand/vanilla';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';

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

    locations: Map<string, SavedLocation>;
    favorites: string[];

    setCwd: (path: string) => Promise<void>;
}

export type FileManagerStoreAPI = StoreApi<FileManagerStore>;

export const createFileManagerStore = (settings: FileManagerSettings): FileManagerStoreAPI => {
    const locations = new Map(Object.entries(settings.locations));
    const { favorites } = settings;

    let setCwdRequest = 0;

    return createStore<FileManagerStore>()((set) => ({
        cwd: '/',
        dir: undefined,

        locations,
        favorites,

        setCwd: async (entryPath) => {
            setCwdRequest = (setCwdRequest + 1) % 10_000;
            const curRequest = setCwdRequest;

            const result = await readMetadata(entryPath);
            if (!result?.ok) return;

            const { type, path } = result.metadata;
            if (curRequest === setCwdRequest && type === 'directory' && path === normalizePath(entryPath)) {
                const dir = await readDirectory(entryPath);
                if (curRequest === setCwdRequest) set({ cwd: entryPath, dir });
            }
        },
    }));
};
