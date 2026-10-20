/*
 * this module contains an implementation of a union mount filesystem consisting of two logical filesystems: a read-only
 * 'base' and a writeable 'overlay'. when an entry is present in both filesystems, the overlay takes precedence.
 *
 * the base filesystem is the same for all clients and is stored on the remote server, with each client retaining a copy
 * of only the metadata (`FsManifest`). the actual content is not persisted locally; contents are fetched on-demand to
 * optimize network usage. the overlay uses zen-fs with an IndexedDB backend (see the interface `System`) and is stored
 * entirely in the client's browser.
 *
 * both the remote and local filesystems contain a metadata and data file (or just the directory) for each individual
 * entry; examples of base and overlay filesystems are shown below:
 *
 * localhost/                                  (base)
 *  |- system_info.metadata
 *  |- system_info.data
 *  |- usr.metadata
 *  |- usr.data/
 *  |   |- sandbox.data.metadata
 *  |   |- sandbox.data.data
 *  |   |- Music.metadata
 *  |   +- Music.data/
 *  |       |- wilt - nothing special.mp3.metadata
 *  |       +- wilt - nothing special.mp3.data
 *  |- var.metadata
 *  +- var.data/
 *      |- lock.metadata
 *      |- lock.data
 *      |- lib.metadata
 *      +- lib.data/
 *          |- logrotate.status.metadata
 *          +- logrotate.status.data
 *
 * localhost/                                  (overlay)
 *  |- usr.metadata
 *  |- usr.data/
 *  |   |- Music.metadata
 *  |   +- Music.data/
 *  |       |- wilt - without you.mp3.metadata
 *  |       +- wilt - without you.mp3.data
 *  |- var.metadata
 *  +- var.data/
 *      |- lock.metadata                       (containing { type: 'deleted' })
 *      |- lib.metadata                        (containing { type: 'file' })
 *      +- lib.data
 *
 * a client's view of the above example through the API exposed by this module should be:
 *
 * localhost/                                  (client)
 *  |- system_info
 *  |- usr/
 *  |   |- sandbox.data
 *  |   +- Music/                              (contents merged)
 *  |       |- wilt - nothing special.mp3
 *  |       +- wilt - without you.mp3
 *  +- var/                                    (`/var/lock` is gone)
 *      +- lib                                 (a regular file; note that `/var/lib/logrotate.status` is gone)
 *
 * note: functions in this module which take paths as arguments will identify the expected type of entry in the
 * parameter name; `filePath` indicates a file, `dirPath` indicates a directory, and `entryPath` indicates that either
 * is acceptable.
 */

import murmurhash from 'murmurhash';
import path from 'path-browserify';

import { systemStore } from '@/hooks/system/useInitializeSystem';

import type { FsDirectoryMetadata, FsFileMetadata, FsSizeMetadata, FsTimeMetadata } from '@protocol7/filesystem-types';

const pathWithHostname = (entryPath: string, hostname?: string) =>
    path.join(hostname ?? systemStore!.getState().hostname, entryPath);

const pathWithExtension = (entryPath: string, extension: string) => {
    const segments = splitPath(entryPath);
    const ancestors = segments.slice(0, -1).map((segment) => segment + DATA_EXTENSION);
    return path.join('/', ...ancestors, segments[segments.length - 1] + extension);
};

/* path conversion utilities */

export const METADATA_EXTENSION = '.metadata';
export const DATA_EXTENSION = '.data';

export const pathToMetadata = (entryPath: string) => pathWithHostname(pathWithExtension(entryPath, METADATA_EXTENSION));

export const pathToData = (entryPath: string) =>
    pathWithHostname(isRoot(entryPath) ? '/' : pathWithExtension(entryPath, DATA_EXTENSION));

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const pathToRemoteURL = (entryPath: string, hostname?: string) =>
    BACKEND_URL + path.join('hosts', pathWithHostname(entryPath, hostname));

/* client path utilities */

export const normalizePath = (entryPath: string) => path.resolve('/', entryPath);

export const isRoot = (entryPath: string) => normalizePath(entryPath) === '/';

export const splitPath = (entryPath: string) => entryPath.split('/').filter((segment) => segment.length > 0);

// whether `filePath` is `ancestorPath` or somewhere under it
export const isSameOrDescendant = (entryPath: string, ancestorPath: string) =>
    entryPath === ancestorPath || entryPath.startsWith(ancestorPath === '/' ? '/' : ancestorPath + '/');

/* metadata conversion utilities */

export const nowTimestamp = () => new Date().toISOString();

export const toFileMetadata = (filePath: string, metadata: FsTimeMetadata & FsSizeMetadata): FsFileMetadata => ({
    ...metadata,
    type: 'file',
    name: path.basename(filePath),
    path: filePath,
    uid: murmurhash.v3(filePath),
});

export const toDirectoryMetadata = (dirPath: string, metadata: FsTimeMetadata): FsDirectoryMetadata => ({
    ...metadata,
    type: 'directory',
    name: path.basename(dirPath),
    path: dirPath,
    uid: murmurhash.v3(dirPath),
});

/* base access utilities */

export const getBaseMetadata = (entryPath: string) => systemStore!.getState().fileManifest.getMetadata(entryPath);

export const getBaseEntries = (dirPath: string) => systemStore!.getState().fileManifest.getEntries(dirPath);

export const fetchBaseData = async (filePath: string): Promise<ArrayBuffer> => {
    const serverFile = await fetch(pathToRemoteURL(filePath));
    if (!serverFile.ok) throw new Error(`fs: failed to fetch file ${filePath} from server!`);

    return serverFile.arrayBuffer();
};
