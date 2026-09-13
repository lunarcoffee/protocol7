import { promises as fs } from '@zenfs/core';
import murmurhash from 'murmurhash';
import path from 'path';

export interface DirectoryEntry {
    name: string;
    path: string;
    pathHash: number;
}

export interface DirectoryHandle {
    entries: DirectoryEntry[];
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

    const entries = await Promise.all(
        dirents.map(async (dirent) => {
            const realPath = await fs.realpath(path.join(dirPath, dirent));
            return {
                name: dirent,
                path: realPath,
                pathHash: murmurhash.v3(realPath),
            };
        }),
    );
    return { entries, ok: true };
};
