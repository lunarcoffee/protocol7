import { promises as fs } from '@zenfs/core';
import path from 'path';

import { systemStore } from '@/stores/system/SystemStoreProvider';

import { FsEntryMetadata } from '..';
import { FsManifestEntryMetadata } from '../manifest';

const pathWithHostname = (filePath: string) => path.join(systemStore!.getState().hostname, filePath);

const pathWithExtension = (filePath: string, extension: string) => {
    const { dir, base } = path.parse(filePath);
    return path.join(dir, base, extension);
};

/* path conversion helpers */

export const pathToMetadata = (filePath: string) => pathWithHostname(pathWithExtension(filePath, '.metadata'));
export const pathToData = (filePath: string) => pathWithHostname(pathWithExtension(filePath, '.data'));

export const pathToRemoteURL = (filePath: string) => path.join('hosts', pathWithHostname(filePath));

/* misc helpers */

export const fetchFileContents = async (filePath: string): Promise<ArrayBuffer> => {
    const serverFile = await fetch(pathToRemoteURL(filePath));
    if (!serverFile.ok) throw new Error('failed to fetch file!');

    const { buffer } = await serverFile.bytes();
    return buffer;
};

// try getting the metadata for `filePath` in the local filesystem, then from the manifest
export const withMetadata = async <T>(
    filePath: string,
    hasLocalEntry: (metadata: FsEntryMetadata) => T,
    hasManifestEntry: (metadata: FsManifestEntryMetadata) => T,
    doesNotExist: () => T,
) => {
    const metadataPath = pathToMetadata(filePath);
    if (await fs.exists(metadataPath)) {
        const metadata = JSON.parse((await fs.readFile(metadataPath)).toString()) as FsEntryMetadata;
        return hasLocalEntry(metadata);
    }

    const manifest = systemStore!.getState().fileManifest;
    const metadata = manifest.getMetadata(filePath);
    return metadata ? hasManifestEntry(metadata) : doesNotExist();
};
