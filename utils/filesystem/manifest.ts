import { FsCommonMetadata, FsFileMetadata, FsTimeMetadata } from '.';

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
    getMetadata: (filePath: string) => FsManifestEntryMetadata | undefined;
}

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
