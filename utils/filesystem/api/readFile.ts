import { promises as fs } from '@zenfs/core';

import { err, ok, Result } from '@/utils/Result';

import { FsFileMetadata } from '..';
import { fetchFileContents, pathToData, pathToRemoteURL, withMetadata } from '.';

export type ReadFileResult = Result<
    {
        metadata: FsFileMetadata;
        contents: () => Promise<ArrayBuffer>;
        objectURL: string;
    },
    string
>;

export const readFile = async (filePath: string): Promise<ReadFileResult> =>
    withMetadata(
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
