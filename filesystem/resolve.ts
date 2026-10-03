import path from 'path-browserify';

import { FsDirectoryMetadata, FsEntryMetadata, FsFileMetadata, OverlayDirectoryMetadata, OverlayFileMetadata } from '.';
import { getBaseEntries, getBaseMetadata, splitPath, toDirectoryMetadata, toFileMetadata } from './internal';
import { FsManifestEntryMetadata, ROOT_DIR_METADATA } from './manifest';
import { listAllOverlayNames, readOverlayMetadata } from './overlay';

/*
 * types and functions for interacting with the unified base and overlay
 */

export type ResolvedFile = {
    type: 'file';
    metadata: FsFileMetadata;

    // where the contents are in the base; if not present, the contents are in the overlay
    contentBasePath?: string;
};

export type ResolvedDirectory = {
    type: 'directory';
    metadata: FsDirectoryMetadata;

    // the base directory this directory is merged with, if any
    basePath?: string;

    // whether this directory has an entry in the overlay (i.e., whether it might have children there)
    inOverlay: boolean;
};

export type ResolvedEntry = ResolvedFile | ResolvedDirectory;

const RESOLVED_ROOT: ResolvedDirectory = {
    type: 'directory',
    metadata: ROOT_DIR_METADATA,
    basePath: '/',
    inOverlay: true,
};

// determine which directory on the base (if any) to merge the given overlay directory with
const resolveDirectoryBasePath = ({ isOpaque, source }: OverlayDirectoryMetadata, defaultBasePath?: string) => {
    if (isOpaque) return;

    const basePath = source || defaultBasePath;
    if (basePath && getBaseEntries(basePath)) return basePath;
};

const resolveChild = async (parent: ResolvedDirectory, childPath: string): Promise<ResolvedEntry | undefined> => {
    const defaultBasePath = parent.basePath ? path.join(parent.basePath, path.basename(childPath)) : undefined;

    // first try to resolve the path in the overlay
    if (parent.inOverlay) {
        const metadata = await readOverlayMetadata(childPath);
        if (metadata?.type === 'deleted') return;

        if (metadata?.type === 'file') {
            return {
                type: 'file',
                metadata: toFileMetadata(childPath, metadata),
                contentBasePath: metadata.source,
            };
        }
        if (metadata?.type === 'directory') {
            return {
                type: 'directory',
                metadata: toDirectoryMetadata(childPath, metadata),
                basePath: resolveDirectoryBasePath(metadata, defaultBasePath),
                inOverlay: true,
            };
        }
    }

    // then try falling back to the base
    if (defaultBasePath) {
        const metadata = getBaseMetadata(defaultBasePath);

        if (metadata?.type === 'file') {
            return {
                type: 'file',
                metadata: toFileMetadata(childPath, metadata),
                contentBasePath: defaultBasePath,
            };
        }
        if (metadata?.type === 'directory-list') {
            return {
                type: 'directory',
                metadata: toDirectoryMetadata(childPath, metadata),
                basePath: defaultBasePath,
                inOverlay: false,
            };
        }
    }
};

// resolves `entryPath` one segment at a time, so that anything in the overlay hides everything under it in the base
export const resolve = async (entryPath: string): Promise<ResolvedEntry | undefined> => {
    let current: ResolvedEntry | undefined = RESOLVED_ROOT;
    let currentPath = '/';

    for (const segment of splitPath(entryPath)) {
        if (current?.type !== 'directory') return;

        currentPath = path.join(currentPath, segment);
        current = await resolveChild(current, currentPath);
    }

    return current;
};

type GenericMetadata = FsManifestEntryMetadata | OverlayFileMetadata | OverlayDirectoryMetadata;

const toFsMetadata = (entryPath: string, metadata: GenericMetadata) =>
    (metadata.type === 'file' ? toFileMetadata : toDirectoryMetadata)(entryPath, metadata);

// merges entries in `dirPath` in the base and the overlay
export const listDirectoryMerged = async (dirPath: string, dir: ResolvedDirectory) => {
    const entries: Record<string, FsEntryMetadata> = {};

    // first gather entries from the base
    if (dir.basePath) {
        const baseEntries = getBaseEntries(dir.basePath);
        for (const [name, metadata] of Object.entries(baseEntries ?? {})) {
            const entryPath = path.join(dirPath, name);
            entries[name] = toFsMetadata(entryPath, metadata);
        }
    }

    if (!dir.inOverlay) return entries;

    const overlayEntries = (await listAllOverlayNames(dirPath)).map(async (name) => {
        const entryPath = path.join(dirPath, name);
        return [name, entryPath, await readOverlayMetadata(entryPath)] as const;
    });

    // then merge in entries from the overlay
    for (const [name, entryPath, metadata] of await Promise.all(overlayEntries)) {
        if (!metadata || metadata.type === 'deleted') delete entries[name];
        else entries[name] = toFsMetadata(entryPath, metadata);
    }

    return entries;
};
