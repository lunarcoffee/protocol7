import path from 'path-browserify';

import { systemStore } from '@/stores/system/SystemStoreProvider';

import { FsDirectoryMetadata, FsFileMetadata, FsTimeMetadata } from '.';

const pathWithHostname = (entryPath: string) => path.join(systemStore!.getState().hostname, entryPath);

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

export const pathToRemoteURL = (entryPath: string) => path.join('hosts', pathWithHostname(entryPath));

/* client path utilities */

export const normalizePath = (entryPath: string) => path.resolve('/', entryPath);

export const isRoot = (entryPath: string) => normalizePath(entryPath) === '/';

export const splitPath = (entryPath: string) => entryPath.split('/').filter((segment) => segment.length > 0);

// whether `filePath` is `ancestorPath` or somewhere under it
export const isSameOrDescendant = (entryPath: string, ancestorPath: string) =>
    entryPath === ancestorPath || entryPath.startsWith(ancestorPath === '/' ? '/' : ancestorPath + '/');

/* metadata conversion utilities */

export const nowTimestamp = () => new Date().toISOString();

export const toFileMetadata = (filePath: string, timeMetadata: FsTimeMetadata): FsFileMetadata => ({
    type: 'file',
    name: path.basename(filePath),
    path: filePath,
    extension: path.extname(filePath),
    ...timeMetadata,
});

export const toDirectoryMetadata = (dirPath: string, timeMetadata: FsTimeMetadata): FsDirectoryMetadata => ({
    type: 'directory',
    name: path.basename(dirPath),
    path: dirPath,
    ...timeMetadata,
});

/* base access utilities */

export const getBaseMetadata = (entryPath: string) => systemStore!.getState().fileManifest.getMetadata(entryPath);

export const getBaseEntries = (dirPath: string) => systemStore!.getState().fileManifest.getEntries(dirPath);

export const fetchBaseData = async (filePath: string): Promise<ArrayBuffer> => {
    const serverFile = await fetch(pathToRemoteURL(filePath));
    if (!serverFile.ok) throw new Error(`fs: failed to fetch file ${filePath} from server!`);

    return serverFile.arrayBuffer();
};
