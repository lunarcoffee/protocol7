import { promises as fs } from '@zenfs/core';
import { Mutex } from 'async-mutex';
import path from 'path-browserify';

import { OverlayDirectoryMetadata, OverlayEntryMetadata } from '.';
import {
    getBaseMetadata,
    isRoot,
    METADATA_EXTENSION,
    nowTimestamp,
    pathToData,
    pathToMetadata,
    splitPath,
} from './internal';
import { resolve } from './resolve';

/*
 * functions for interacting with the overlay; callers must hold `overlayMutex` when performing write operations!
 */

export const overlayMutex = new Mutex();

/* metadata utilities */

export const readOverlayMetadata = async (entryPath: string) => {
    const metadataPath = pathToMetadata(entryPath);
    if (await fs.exists(metadataPath)) {
        return JSON.parse((await fs.readFile(metadataPath)).toString()) as OverlayEntryMetadata;
    }
};

export const writeOverlayMetadata = (entryPath: string, metadata: OverlayEntryMetadata) =>
    fs.writeFile(pathToMetadata(entryPath), JSON.stringify(metadata));

export const touchOverlayEntry = async (entryPath: string) => {
    if (isRoot(entryPath)) return;

    const metadata = await readOverlayMetadata(entryPath);
    if (metadata && metadata?.type !== 'deleted') {
        await writeOverlayMetadata(entryPath, { ...metadata, modified: nowTimestamp() });
    }
};

// names of all entries in the overlay directory at `dirPath`, including deleted ones
export const listAllOverlayNames = async (dirPath: string) =>
    (await fs.readdir(pathToData(dirPath)))
        .filter((name) => name.endsWith(METADATA_EXTENSION))
        .map((name) => name.slice(0, -METADATA_EXTENSION.length));

// whether the base has an entry that would appear at `entryPath` as long as it isn't hidden by the overlay
export const hasUnderlyingBaseEntry = async (entryPath: string) => {
    const parent = await resolve(path.dirname(entryPath));
    if (parent?.type !== 'directory' || !parent.basePath) return false;

    return !!getBaseMetadata(path.join(parent.basePath, path.basename(entryPath)));
};

/* data utilities */

export const readOverlayData = async (filePath: string) => (await fs.readFile(pathToData(filePath))).buffer;

export const eraseOverlayData = (entryPath: string) => fs.rm(pathToData(entryPath), { recursive: true, force: true });

// creates an empty directory at `dirPath`; its parent must already be in the overlay
export const writeOverlayDirectory = async (dirPath: string, metadata: OverlayDirectoryMetadata) => {
    await eraseOverlayData(dirPath);

    await fs.mkdir(pathToData(dirPath));
    await writeOverlayMetadata(dirPath, metadata);
};

// the parent of `entryPath` must already be in the overlay
export const removeOverlayEntry = async (entryPath: string) => {
    if (await hasUnderlyingBaseEntry(entryPath)) await writeOverlayMetadata(entryPath, { type: 'deleted' });
    else await fs.rm(pathToMetadata(entryPath), { force: true, recursive: true });

    await eraseOverlayData(entryPath);
};

// like `mkdir -p` except it also copies metadata from the base if it exists
export const copyDirectoryToOverlay = async (dirPath: string) => {
    let currentPath = '/';

    for (const segment of splitPath(dirPath)) {
        currentPath = path.join(currentPath, segment);

        const dir = await resolve(currentPath);
        if (dir?.type !== 'directory') throw new Error(`fs: ${currentPath} is not a directory!`);
        if (dir.inOverlay) continue;

        // no `source` is needed, since the parent's base directory is unchanged
        const { created, modified } = dir.metadata;
        await writeOverlayDirectory(currentPath, { type: 'directory', created, modified });
    }
};
