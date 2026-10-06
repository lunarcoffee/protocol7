import { promises as fs } from '@zenfs/core';
import path from 'path-browserify';

import { err, ok, Result } from '@/utils/Result';

import { FsEntryMetadata, OverlayEntryMetadata } from '..';
import { isRoot, isSameOrDescendant, normalizePath, pathToData } from '../internal';
import { overlayMutex, writeOverlayMetadata } from '../overlay';
import { copyDirectoryToOverlay, eraseOverlayData, removeOverlayEntry, touchOverlayEntry } from '../overlay';
import { resolve, ResolvedEntry } from '../resolve';

// generate new metadata for `entry`; an entry whose contents are in the base keeps referring to their previous location
// instead of copying them into the overlay
const movedMetadata = (entry: ResolvedEntry): OverlayEntryMetadata => {
    const { created, modified } = entry.metadata;

    if (entry.type === 'file') {
        const {
            contentBasePath,
            metadata: { size },
        } = entry;

        return {
            type: 'file',
            created,
            modified,
            size,
            ...(contentBasePath && { source: contentBasePath }),
        };
    }

    const { basePath } = entry;
    return {
        type: 'directory',
        created,
        modified,
        // if the entry didn't already have a base path, mark the new entry as opaque so we don't inadverdently merge
        // with anything (e.g., if we overwrote a deleted entry)
        ...(basePath ? { source: basePath } : { isOpaque: true }),
    };
};

export type MoveSuccess = { metadata: FsEntryMetadata };
export type MoveError = 'EROOT' | 'ESUBDIR' | 'ENOENT' | 'EEXIST';

export type MoveResult = Result<MoveSuccess, MoveError>;

export interface MoveOptions {
    noOverwrite?: boolean;
}

// moves the entry at `srcPath` to `destPath`; the destination's parent directory must exist
export const move = async (
    srcPath: string,
    destPath: string,
    { noOverwrite = false }: MoveOptions = {},
): Promise<MoveResult> => {
    srcPath = normalizePath(srcPath);
    destPath = normalizePath(destPath);

    if (isRoot(srcPath)) return err('EROOT');
    if (isSameOrDescendant(destPath, srcPath)) return err('ESUBDIR');

    const srcParentPath = path.dirname(srcPath);
    const destParentPath = path.dirname(destPath);

    return await overlayMutex.runExclusive(async () => {
        const srcEntry = await resolve(srcPath);
        if (!srcEntry || (await resolve(destParentPath))?.type !== 'directory') return err('ENOENT');

        if (noOverwrite && (await resolve(destPath))) return err('EEXIST');

        await copyDirectoryToOverlay(srcParentPath);
        await copyDirectoryToOverlay(destParentPath);

        await eraseOverlayData(destPath);

        // first, move the actual data; we only need to move the data for a file if it doesn't link to content in the
        // base (i.e., if it stores its data in the overlay)
        if (srcEntry.type === 'file' && !srcEntry.contentBasePath) {
            await fs.rename(pathToData(srcPath), pathToData(destPath));
        } else if (srcEntry.type === 'directory') {
            if (srcEntry.inOverlay) await fs.rename(pathToData(srcPath), pathToData(destPath));
            else await fs.mkdir(pathToData(destPath));
        }

        // then, move the metadata
        await writeOverlayMetadata(destPath, movedMetadata(srcEntry));
        await removeOverlayEntry(srcPath);

        await touchOverlayEntry(srcParentPath);
        await touchOverlayEntry(destParentPath);

        // we don't really need to use `resolve` to do this but i'm lazy and this is easy
        return ok({ metadata: (await resolve(destPath))!.metadata });
    });
};
