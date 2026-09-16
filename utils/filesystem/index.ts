import { promises as fs } from '@zenfs/core';
import { Mutex } from 'async-mutex';

/*
 * both the remote and local filesystems contain a metadata and data file (or just the directory) for each entry:
 *
 * [hostname]/
 *  |- file1.metadata
 *  |- file1.data
 *  |- dir1.metadata
 *  |- dir1.dir/
 *  |   |- file2.metadata
 *  |   +- file2.data
 *  |- dir2.metadata
 *  +- dir2.data/
 *      |- file4.metadata
 *      |- file4.data
 *      |- dir3.metadata
 *      +- dir3.data/
 */

export interface RemoteFsManifest {
    getMetadata: (filePath: string) => FsManifestEntryMetadata | undefined;
}

export type FsCommonMetadata = { name: string; path: string };
export type FsTimeMetadata = { created: string; modified: string };

// { type: 'deleted' } is only used to override the existence of an entry (i.e., only for entries in the manifest)
export type FsFileMetadata = { type: 'file'; extension: string } & FsCommonMetadata & FsTimeMetadata;
export type FsDirectoryMetadata = { type: 'directory' } & FsCommonMetadata & FsTimeMetadata;
export type FsDeletedMetadata = { type: 'deleted' } & FsCommonMetadata;

export type FsEntryMetadata = FsFileMetadata | FsDirectoryMetadata | FsDeletedMetadata;

// only used in the remote filesystem manifest
export type FsDirectoryListingMetadata = {
    type: 'directory-list';
    entries: Record<string, FsManifestEntryMetadata>;
} & FsCommonMetadata &
    FsTimeMetadata;

export type FsManifestEntryMetadata = FsFileMetadata | FsDirectoryListingMetadata;

// fetched from the remote server; contains metadata for the entire base filesystem
export type FsManifest = Record<string, FsManifestEntryMetadata>;

const getMetadataFromManifest = (manifest: FsManifest, filePath: string) => {
    const [segment, ...rest] = filePath.split('/').filter((segment) => segment.length > 0);
    if (rest.length === 0) return manifest[segment];

    const dir = manifest[segment];
    if (!dir || dir.type !== 'directory-list') return;
    return getMetadataFromManifest(dir.entries, rest.join('/'));
};

export const fetchManifest = async (hostname: string): Promise<RemoteFsManifest | undefined> => {
    try {
        const response = await fetch('hosts/' + hostname);
        const manifest = (await response.json()) as FsManifest;

        return { getMetadata: (filePath: string) => getMetadataFromManifest(manifest, filePath) };
    } catch (err) {
        console.error('exception while fetching remote filesystem manifest!', err);
    }
};

const resetLocalFilesystemMutex = new Mutex();

export const resetLocalFilesystem = async (hostname: string) => {
    try {
        await resetLocalFilesystemMutex.runExclusive(async () => {
            if (await fs.exists(hostname)) await fs.rm(hostname, { recursive: true });
            await fs.mkdir(hostname);
        });
    } catch (err) {
        console.warn(`exception while resetting local filesystem for host ${hostname}!`, err);
    }
};
