/* client-facing metadata types */

export type FsCommonMetadata = { name: string; path: string; uid: number };
export type FsTimeMetadata = { created: string; modified: string };
export type FsSizeMetadata = { size: number };

export type FsFileMetadata = { type: 'file' } & FsCommonMetadata & FsTimeMetadata & FsSizeMetadata;
export type FsDirectoryMetadata = { type: 'directory' } & FsCommonMetadata & FsTimeMetadata;

export type FsEntryMetadata = FsFileMetadata | FsDirectoryMetadata;

/* metadata as stored in the overlay */

export type OverlayFileMetadata = { type: 'file'; source?: string } & FsTimeMetadata & FsSizeMetadata;
export type OverlayDirectoryMetadata = { type: 'directory'; isOpaque?: boolean; source?: string } & FsTimeMetadata;
export type OverlayDeletedMetadata = { type: 'deleted' };

export type OverlayEntryMetadata = OverlayFileMetadata | OverlayDirectoryMetadata | OverlayDeletedMetadata;

/* types for after resolution in the unified base and overlay filesystems */

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

/* manifest-related types */

export type FsDirectoryListingMetadata = {
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
