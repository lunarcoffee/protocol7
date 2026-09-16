import fs from 'fs/promises';
import path from 'path';

import { FsDirectoryMetadata, FsFileMetadata } from '@/utils/filesystem';
import { FsManifest, FsManifestEntryMetadata } from '@/utils/filesystem/manifest';

export const toDataPath = (filePath: string): string =>
    filePath.replaceAll(/(?<!^)\//g, '.data/').replace(/(?<!\/)$/, '.data');

const toMetadataPath = (filePath: string): string => toDataPath(filePath).replace(/\.data\/?$/, '.metadata');

// path expected by the client (without .data or .metadata extensions)
const toClientPath = (filePath: string): string => filePath.replaceAll(/\.(data|metadata)(?:\/|$)/g, '');

const readMetadataOrDefault = async (fileRoot: string, clientPath: string): Promise<FsManifestEntryMetadata> => {
    const metadataPath = path.join(fileRoot, toMetadataPath(clientPath));

    try {
        const metadataFile = await fs.readFile(metadataPath);
        const metadata = JSON.parse(metadataFile.toString()) as FsFileMetadata | FsDirectoryMetadata;

        if (metadata.type === 'file') return metadata;
        return { ...metadata, type: 'directory-list', entries: await generateManifest(fileRoot, clientPath) };
    } catch {
        // assume metadata file doesn't exist, use actual data file metadata as fallback
        const dataPath = path.join(fileRoot, toDataPath(clientPath));
        const stats = await fs.stat(dataPath);

        const commonMetadata = {
            name: path.basename(clientPath),
            path: clientPath,
            created: stats.ctime.toISOString(),
            modified: stats.mtime.toISOString(),
        };

        if (stats.isFile()) return { ...commonMetadata, type: 'file', extension: path.extname(clientPath) };
        return { ...commonMetadata, type: 'directory-list', entries: await generateManifest(fileRoot, clientPath) };
    }
};

const generateManifest = async (fileRoot: string, dirPath: string): Promise<FsManifest> => {
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

// serves base filesystem manifest
export const GET = async (_: Request, { params }: RouteContext<'/hosts/[host]'>) => {
    const { host } = await params;

    // TODO: cache this or generate statically for performance
    const fileRoot = path.join('public', host);
    const entries = await generateManifest(fileRoot, '/');

    return Response.json(entries);
};
