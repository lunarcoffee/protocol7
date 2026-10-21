import { getRemoteManifestURL, isRoot, splitPath, toDirectoryMetadata } from './internal';

import type { FsManifest, FsManifestEntryMetadata, RemoteFsManifest } from '@protocol7/filesystem-types';

const EPOCH = new Date(0).toISOString();

export const ROOT_DIR_METADATA = toDirectoryMetadata('/', { created: EPOCH, modified: EPOCH });

const getMetadataFromManifest = (manifest: FsManifest, entryPath: string): FsManifestEntryMetadata | undefined => {
    const [segment, ...rest] = splitPath(entryPath);
    if (!segment) return undefined;
    if (rest.length === 0) return manifest[segment];

    const dir = manifest[segment];
    return dir && dir.type === 'directory-list' ? getMetadataFromManifest(dir.entries, rest.join('/')) : undefined;
};

const getEntriesFromManifest = (manifest: FsManifest, dirPath: string) => {
    if (isRoot(dirPath)) return manifest;

    const dir = getMetadataFromManifest(manifest, dirPath);
    return dir?.type === 'directory-list' ? dir.entries : undefined;
};

export const fetchManifest = async (hostname: string): Promise<RemoteFsManifest | undefined> => {
    try {
        const response = await fetch(getRemoteManifestURL(hostname));
        const manifest = (await response.json()) as FsManifest;

        return {
            getMetadata: (filePath: string) => getMetadataFromManifest(manifest, filePath),
            getEntries: (dirPath: string) => getEntriesFromManifest(manifest, dirPath),
        };
    } catch (err) {
        console.error(`fs: exception while fetching manifest for host ${hostname}!`, err);
        return undefined;
    }
};
