import path from 'path-browserify';

import { err, ok, Result } from '@/utils/Result';

import { isRoot, normalizePath } from '../internal';
import { copyDirectoryToOverlay, overlayMutex, removeOverlayEntry, touchOverlayEntry } from '../overlay';
import { listDirectoryMerged, resolve } from '../resolve';

export type RemoveError = 'EROOT' | 'ENOENT' | 'ENOTEMPTY';

export type RemoveResult = Result<undefined, RemoveError>;

export type RemoveOptions = {
    recursive?: boolean;
};

export const remove = async (entryPath: string, { recursive = false }: RemoveOptions = {}): Promise<RemoveResult> => {
    entryPath = normalizePath(entryPath);

    if (isRoot(entryPath)) return err('EROOT');

    return await overlayMutex.runExclusive(async () => {
        const entry = await resolve(entryPath);
        if (!entry) return err('ENOENT');

        // without `recursive: true`, directories must be empty to be deleted
        if (entry.type === 'directory' && !recursive) {
            const entries = await listDirectoryMerged(entryPath, entry);
            if (Object.keys(entries).length > 0) return err('ENOTEMPTY');
        }

        // this is only really necessary when deleting base entries; we need to create a whiteout file in the parent
        const parentPath = path.dirname(entryPath);
        await copyDirectoryToOverlay(parentPath);

        // this takes care of recursive deletion and creating whiteout files (if needed)
        await removeOverlayEntry(entryPath);

        await touchOverlayEntry(parentPath);

        return ok(undefined);
    });
};
