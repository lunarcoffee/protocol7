import {
    type FsDirectoryMetadata,
    type FsFileMetadata,
    type FsManifest,
    type FsManifestEntryMetadata,
} from '@protocol7/filesystem-types';
import fs from 'fs/promises';
import murmurhash from 'murmurhash';
import path from 'path';

import { config } from '../config.js';
import { logger } from '../logger.js';
import { toClientPath, toDataPath, toMetadataPath } from '../utils.js';

const getDataFileMetadata = async (
    fileRoot: string,
    clientPath: string,
): Promise<FsFileMetadata | FsDirectoryMetadata> => {
    const dataPath = path.join(fileRoot, toDataPath(clientPath));
    const stats = await fs.stat(dataPath);

    const commonMetadata = {
        name: path.basename(clientPath),
        path: clientPath,
        uid: murmurhash.v3(clientPath),

        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
    };

    return stats.isFile()
        ? { ...commonMetadata, type: 'file', size: stats.size }
        : { ...commonMetadata, type: 'directory' };
};

const generateMetadata = async (fileRoot: string, clientPath: string): Promise<FsManifestEntryMetadata> => {
    const metadataPath = path.join(fileRoot, toMetadataPath(clientPath));

    // try loading metadata from the metadata file (it might not exist)
    let customMetadata = {};
    try {
        const metadataFile = await fs.readFile(metadataPath);
        const metadataJson = JSON.parse(metadataFile.toString()) as unknown;

        if (metadataJson && typeof metadataJson === 'object') customMetadata = metadataJson;
        else logger.warn({ metadataPath }, 'invalid metadata file, ignoring');
    } catch {}

    // prefer metadata from the metadata file but use the data file's actual metadata as a fallback; this allows
    // metadata files to omit redundant fields
    const actualMetadata = await getDataFileMetadata(fileRoot, clientPath);
    const metadata = { ...actualMetadata, ...customMetadata };

    return metadata.type === 'file'
        ? metadata
        : { ...metadata, type: 'directory-list', entries: await generateManifest(fileRoot, clientPath) };
};

const generateManifest = async (fileRoot: string, dirPath: string): Promise<FsManifest> => {
    const dirDataPath = path.join(fileRoot, toDataPath(dirPath));
    const dirents = await fs.readdir(dirDataPath, { withFileTypes: true });

    const entries = dirents
        .filter(({ name }) => name.endsWith('.data'))
        .map(async (dirent) => {
            const name = toClientPath(dirent.name);
            const clientPath = path.join(dirPath, name);
            return [name, await generateMetadata(fileRoot, clientPath)];
        });

    return Object.fromEntries(await Promise.all(entries));
};

const manifestCache = new Map<string, FsManifest>();

export const regenerateManifest = async (host: string) => {
    const fileRoot = path.join(config.HOST_ASSETS_PATH, host);
    const manifest = await generateManifest(fileRoot, '/');

    manifestCache.set(host, manifest);
    logger.info({ host }, 'regenerated fs manifest');

    return manifest;
};

// read from cache or generate if no entry
export const getManifest = async (host: string) => manifestCache.get(host) || (await regenerateManifest(host));
