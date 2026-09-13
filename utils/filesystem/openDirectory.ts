import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';

export interface DirectoryHandle {
    entries: () => string[];
    entriesAbsolute: () => string[];
}

export interface OpenDirectoryError {
    error: 'not found';
}

export type OpenDirectoryResult = (DirectoryHandle & { ok: true }) | (OpenDirectoryError & { ok: false });

export const openDirectory = async (path: PathLike, hostname: string): Promise<OpenDirectoryResult> => {
    const dirents = await fs.readdir(`${hostname}/${path}`).catch(() => null);
    if (!dirents) return { error: 'not found', ok: false };

    dirents.sort();

    return {
        entries: () => dirents,
        entriesAbsolute: () => dirents.map((dirent) => `${path}/${dirent}`),
        ok: true,
    };
};
