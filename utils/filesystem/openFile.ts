import { promises as fs } from '@zenfs/core';
import murmurhash from 'murmurhash';
import path from 'path';

import { fetchFileForHost } from '.';
import { FS_SKELETON_PLACEHOLDER } from '.';

export interface FileHandle {
    name: string;
    extension: string;
    path: string;
    pathHash: number;

    contents: Buffer;
    contentsAsObjectURL: string;
}

export interface OpenFileError {
    error: 'not found';
}

export type OpenFileResult = (FileHandle & { ok: true }) | (OpenFileError & { ok: false });

export interface OpenFileOptions {
    noFetch?: boolean;
}

export const openFile = async (
    filePath: string,
    hostname: string,
    { noFetch }: OpenFileOptions = {},
): Promise<OpenFileResult> => {
    const hostQualifiedPath = path.join(hostname, filePath);

    let buffer = await fs.readFile(hostQualifiedPath).catch(() => null);
    if (!buffer) return { error: 'not found', ok: false };

    // current file is a placeholder from the skeleton; need to fetch actual contents
    if (!noFetch && buffer.readUint32BE() === FS_SKELETON_PLACEHOLDER) {
        const hostFile = await fetchFileForHost(hostname, filePath);
        if (!hostFile) {
            await fs.rm(hostQualifiedPath, { force: true });
            return { error: 'not found', ok: false };
        }
        buffer = hostFile;
    }

    // for elements taking URLs (e.g. <img>)
    const blob = new Blob([Buffer.from(buffer)]);
    const objectURL = URL.createObjectURL(blob);

    const realPath = await fs.realpath(filePath);

    return {
        name: path.basename(realPath),
        extension: path.extname(realPath),
        path: realPath,
        pathHash: murmurhash.v3(realPath),

        contents: buffer,
        contentsAsObjectURL: objectURL,

        ok: true,
    };
};
