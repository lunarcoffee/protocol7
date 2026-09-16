import { Dirent, promises as fs } from '@zenfs/core';
import path from 'path';

import { systemStore } from '@/stores/system/SystemStoreProvider';

import { err, ok, Result } from '../Result';
import { FsDirectoryMetadata, FsEntryMetadata, FsFileMetadata, FsManifestEntryMetadata } from '.';

/*
 * generally, we try to do everything locally before deferring to the manifest or data stored on the server
 */

const pathWithHostname = (filePath: string) => path.join(systemStore!.getState().hostname, filePath);

const pathWithExtension = (filePath: string, extension: string) => {
    const { dir, base } = path.parse(filePath);
    return path.join(dir, base, extension);
};

const pathToMetadata = (filePath: string) => pathWithHostname(pathWithExtension(filePath, '.metadata'));
const pathToData = (filePath: string) => pathWithHostname(pathWithExtension(filePath, '.data'));

const pathToRemoteURL = (filePath: string) => path.join('hosts', pathWithHostname(filePath));

const fetchFileContents = async (filePath: string): Promise<ArrayBuffer> => {
    const serverFile = await fetch(pathToRemoteURL(filePath));
    if (!serverFile.ok) throw new Error('failed to fetch file!');

    const { buffer } = await serverFile.bytes();
    return buffer;
};

const tryWithMetadata = async <T>(
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

export const exists = async (filePath: string): Promise<boolean> =>
    tryWithMetadata(
        filePath,
        ({ type }) => type !== 'deleted',
        () => true,
        () => false,
    );

export type ReadFileResult = Result<
    {
        metadata: FsFileMetadata;
        contents: () => Promise<ArrayBuffer>;
        objectURL: string;
    },
    string
>;

export const readFile = async (filePath: string): Promise<ReadFileResult> =>
    tryWithMetadata(
        filePath,
        async (metadata) => {
            if (metadata.type === 'deleted') return err('not found!');
            if (metadata.type !== 'file') return err('not a file!');

            const { buffer } = await fs.readFile(pathToData(filePath));
            const blob = new Blob([buffer]);
            const objectURL = URL.createObjectURL(blob);

            return ok({ metadata, contents: async () => buffer, objectURL });
        },
        async (metadata) => {
            if (metadata.type !== 'file') return err('not a file!');

            const objectURL = pathToRemoteURL(filePath);
            return ok({ metadata, contents: () => fetchFileContents(filePath), objectURL });
        },
        async () => err('not found!'),
    );

export type ReadDirectoryResult = Result<
    {
        metadata: FsDirectoryMetadata;
        entries: Record<string, FsEntryMetadata>;
    },
    string
>;

const direntToMetadata = async (parentPath: string, dirent: Dirent): Promise<FsEntryMetadata> => {
    const metadata = await fs.readFile(pathToMetadata(path.join(parentPath, dirent.name)));
    return JSON.parse(metadata.toString()) as FsEntryMetadata;
};

export const readDirectory = async (dirPath: string): Promise<ReadDirectoryResult> =>
    tryWithMetadata(
        dirPath,
        async (metadata) => {
            if (metadata.type === 'deleted') return err('not found!');
            if (metadata.type !== 'directory') return err('not a directory!');

            const dirents = await fs.readdir(pathToData(dirPath), { withFileTypes: true });
            const entryPromises = dirents.map(async (dirent) => [dirent.name, await direntToMetadata(dirPath, dirent)]);
            const entries = Object.fromEntries(await Promise.all(entryPromises));

            return ok({ metadata, entries });
        },
        async (metadata) => {
            if (metadata.type !== 'directory-list') return err('not a directory!');

            return ok({
                metadata: { ...metadata, type: 'directory' },
                entries: metadata.entries,
            });
        },
        async () => err('not found!'),
    );

// TODO: delete
// if file is not in manifest:
//   just delete
// if file is in manifest:
//   must recursively mark all children as deleted

// TODO: write (overwrite)
// can just write i think

// TODO: update (append)
// if file exists locally:
//   can just write
// if file is not in manifest:
//   can just write
// if file is in manifest:
//   need to get contents from remote first

// TODO: create
// can just create
// also might not have this tbh i might just combine it with the rest
