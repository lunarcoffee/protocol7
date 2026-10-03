import path from 'path-browserify';

import { err, ok, Result } from '@/utils/Result';

import { FsDirectoryMetadata } from '..';
import { normalizePath, nowTimestamp, toDirectoryMetadata } from '../internal';
import { copyDirectoryToOverlay, overlayMutex, touchOverlayEntry, writeOverlayDirectory } from '../overlay';
import { hasUnderlyingBaseEntry } from '../overlay';
import { resolve } from '../resolve';

export type CreateDirectorySuccess = { metadata: FsDirectoryMetadata };
export type CreateDirectoryError = 'ENOENT' | 'EEXIST';

export type CreateDirectoryResult = Result<CreateDirectorySuccess, CreateDirectoryError>;

// TODO: support recursive mkdir
export const createDirectory = (dirPath: string): Promise<CreateDirectoryResult> => {
    dirPath = normalizePath(dirPath);

    const parentPath = path.dirname(dirPath);

    return overlayMutex.runExclusive(async () => {
        const parentEntry = await resolve(parentPath);

        if (parentEntry?.type !== 'directory') return err('ENOENT');
        if (await resolve(dirPath)) return err('EEXIST');

        // if `dirPath` has a base entry, it must have been deleted in the overlay or we'd have run into EEXIST
        const isOpaque = await hasUnderlyingBaseEntry(dirPath);

        const created = nowTimestamp();
        const metadata = { type: 'directory', created, modified: created, isOpaque } as const;

        // this is necessary in case any of the ancestors of `dirPath` don't exist in the overlay; in the checks
        // above, we only guarantee that they exist in the base
        await copyDirectoryToOverlay(parentPath);

        await writeOverlayDirectory(dirPath, metadata);

        await touchOverlayEntry(parentPath);

        return ok({ metadata: toDirectoryMetadata(dirPath, metadata) });
    });
};
