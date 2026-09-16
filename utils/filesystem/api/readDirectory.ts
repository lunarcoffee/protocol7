import { Dirent } from '@zenfs/core';
import { promises as fs } from '@zenfs/core';
import path from 'path';

import { err, ok, Result } from '@/utils/Result';

import { FsDirectoryMetadata, FsEntryMetadata } from '..';
import { pathToData, pathToMetadata, withMetadata } from '.';

export const direntToMetadata = async (parentPath: string, dirent: Dirent) => {
    const metadata = await fs.readFile(pathToMetadata(path.join(parentPath, dirent.name)));
    return JSON.parse(metadata.toString()) as FsEntryMetadata;
};

export type ReadDirectoryResult = Result<
    {
        metadata: FsDirectoryMetadata;
        entries: Record<string, FsEntryMetadata>;
    },
    string
>;

// TODO: actually this is broken . we need to merge these not just take one or the other
export const readDirectory = async (dirPath: string): Promise<ReadDirectoryResult> =>
    withMetadata(
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
