import { promises as fs } from '@zenfs/core';
import path from 'path-browserify';

import { err, ok, Result } from '@/utils/Result';

import { FsFileMetadata } from '..';
import { normalizePath, nowTimestamp, pathToData, toFileMetadata } from '../internal';
import { overlayMutex, writeOverlayMetadata } from '../overlay';
import { copyDirectoryToOverlay, eraseOverlayData, touchOverlayEntry } from '../overlay';
import { resolve } from '../resolve';

export type WriteFileSuccess = { metadata: FsFileMetadata };
export type WriteFileError = 'ENOENT' | 'EEXIST';

export type WriteFileResult = Result<WriteFileSuccess, WriteFileError>;

export type WriteFileContents = string | Uint8Array;

export interface WriteFileOptions {
    noOverwrite?: boolean;
}

// creates or overwrites the file at `filePath`; if it was previously moved from the base, it no longer refers to the
// base contents
export const writeFile = (
    filePath: string,
    contents: WriteFileContents,
    { noOverwrite = false }: WriteFileOptions = {},
): Promise<WriteFileResult> => {
    filePath = normalizePath(filePath);

    const parentPath = path.dirname(filePath);

    return overlayMutex.runExclusive(async () => {
        const parentEntry = await resolve(parentPath);
        if (parentEntry?.type !== 'directory') return err('ENOENT');

        const existingEntry = await resolve(filePath);
        if ((noOverwrite && existingEntry) || existingEntry?.type === 'directory') return err('EEXIST');

        await copyDirectoryToOverlay(parentPath);

        // delete and rewrite data; TODO: implement append mode
        await eraseOverlayData(filePath);
        await fs.writeFile(pathToData(filePath), contents);

        const modified = nowTimestamp();
        const newMetadata = {
            type: 'file',
            extension: path.extname(filePath),
            created: existingEntry?.metadata.created ?? modified,
            modified,
        } as const;

        await writeOverlayMetadata(filePath, newMetadata);

        if (!existingEntry) await touchOverlayEntry(parentPath);

        return ok({ metadata: toFileMetadata(filePath, newMetadata) });
    });
};
