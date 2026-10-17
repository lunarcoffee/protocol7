import {
    type FsDirectoryMetadata,
    type FsFileMetadata,
    type FsManifest,
    type FsManifestEntryMetadata,
} from '@protocol7/filesystem-types';
import fs from 'fs/promises';
import murmurhash from 'murmurhash';
import path from 'path';

import { toClientPath, toDataPath, toMetadataPath } from './utils.js';

const readMetadataOrDefault = async (fileRoot: string, clientPath: string): Promise<FsManifestEntryMetadata> => {
    const metadataPath = path.join(fileRoot, toMetadataPath(clientPath));

    try {
        const metadataFile = await fs.readFile(metadataPath);
        // TODO: this is a pretty damn safe assumption cause i contorl the data but MAYBE its worth looking into in case
        // i make a mistake
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const metadata = JSON.parse(metadataFile.toString()) as FsFileMetadata | FsDirectoryMetadata;

        // TODO: allow partial metadata and fill in missing fields if computable (e.g., uid)

        if (metadata.type === 'file') return metadata;
        return { ...metadata, type: 'directory-list', entries: await generateManifest(fileRoot, clientPath) };
    } catch {
        // assume metadata file doesn't exist, use actual data file metadata as fallback
        const dataPath = path.join(fileRoot, toDataPath(clientPath));
        const stats = await fs.stat(dataPath);

        const commonMetadata = {
            name: path.basename(clientPath),
            path: clientPath,
            uid: murmurhash.v3(clientPath),

            created: stats.birthtime.toISOString(),
            modified: stats.mtime.toISOString(),
        };

        if (stats.isFile()) return { ...commonMetadata, type: 'file', size: stats.size };
        return { ...commonMetadata, type: 'directory-list', entries: await generateManifest(fileRoot, clientPath) };
    }
};

export const generateManifest = async (fileRoot: string, dirPath: string): Promise<FsManifest> => {
    const dirDataPath = path.join(fileRoot, toDataPath(dirPath));
    const dirents = await fs.readdir(dirDataPath, { withFileTypes: true });

    const entries = dirents
        .filter(({ name }) => name.endsWith('.data'))
        .map(async (dirent) => {
            const name = toClientPath(dirent.name);
            const clientPath = path.join(dirPath, name);
            return [name, await readMetadataOrDefault(fileRoot, clientPath)];
        });

    return Object.fromEntries(await Promise.all(entries));
};
