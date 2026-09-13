import { promises as fs } from '@zenfs/core';
import path from 'path';

export interface DirectoryHandle {
    entries: () => string[];
    entriesAbsolute: () => string[];
}

export interface OpenDirectoryError {
    error: 'not found';
}

export type OpenDirectoryResult = (DirectoryHandle & { ok: true }) | (OpenDirectoryError & { ok: false });

export const openDirectory = async (dirPath: string, hostname: string): Promise<OpenDirectoryResult> => {
    const hostQualifiedPath = path.join(hostname, dirPath);

    const dirents = await fs.readdir(hostQualifiedPath).catch(() => null);
    if (!dirents) return { error: 'not found', ok: false };

    dirents.sort();

    return {
        entries: () => dirents,
        entriesAbsolute: () => dirents.map((dirent) => `${dirPath}/${dirent}`),
        ok: true,
    };
};
