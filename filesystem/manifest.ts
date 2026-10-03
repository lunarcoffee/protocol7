import { FsCommonMetadata, FsFileMetadata, FsTimeMetadata } from '.';
import { isRoot, splitPath, toDirectoryMetadata } from './internal';

type FsDirectoryListingMetadata = {
    type: 'directory-list';
    entries: Record<string, FsManifestEntryMetadata>;
} & FsCommonMetadata &
    FsTimeMetadata;

export type FsManifestEntryMetadata = FsFileMetadata | FsDirectoryListingMetadata;

// the object as sent by the server
export type FsManifest = Record<string, FsManifestEntryMetadata>;

// wrapper for general use
export interface RemoteFsManifest {
    getMetadata: (entryPath: string) => FsManifestEntryMetadata | undefined;
    getEntries: (dirPath: string) => FsManifest | undefined;
}

const EPOCH = new Date(0).toISOString();

export const ROOT_DIR_METADATA = toDirectoryMetadata('/', { created: EPOCH, modified: EPOCH });

const getMetadataFromManifest = (manifest: FsManifest, entryPath: string) => {
    const [segment, ...rest] = splitPath(entryPath);
    if (!segment) return;
    if (rest.length === 0) return manifest[segment];

    const dir = manifest[segment];
    if (!dir || dir.type !== 'directory-list') return;

    return getMetadataFromManifest(dir.entries, rest.join('/'));
};

const getEntriesFromManifest = (manifest: FsManifest, dirPath: string) => {
    if (isRoot(dirPath)) return manifest;

    const dir = getMetadataFromManifest(manifest, dirPath);
    if (dir?.type === 'directory-list') return dir.entries;
};

export const fetchManifest = async (hostname: string): Promise<RemoteFsManifest | undefined> => {
    try {
        const response = await fetch('hosts/' + hostname);
        const manifest = (await response.json()) as FsManifest;

        return {
            getMetadata: (filePath: string) => getMetadataFromManifest(manifest, filePath),
            getEntries: (dirPath: string) => getEntriesFromManifest(manifest, dirPath),
        };
    } catch (err) {
        console.error(`fs: exception while fetching manifest for host ${hostname}!`, err);
    }
};
