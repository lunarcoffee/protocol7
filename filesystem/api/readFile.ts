import { err, ok, Result } from '@/utils/Result';

import { FsFileMetadata } from '..';
import { fetchBaseData, normalizePath, pathToRemoteURL } from '../internal';
import { overlayMutex, readOverlayData } from '../overlay';
import { resolve } from '../resolve';

export type ReadFileSuccess = {
    metadata: FsFileMetadata;

    // though this is a function, the returned data reflects the state of the file at the time of calling `readFile`,
    // not at the time of calling `contents`
    contents: () => Promise<ArrayBuffer>;

    getObjectURL: () => string;
    revokeObjectURL?: () => void;
};

export type ReadFileError = 'ENOENT';

export type ReadFileResult = Result<ReadFileSuccess, ReadFileError>;

export const readFile = (filePath: string): Promise<ReadFileResult> => {
    filePath = normalizePath(filePath);

    return overlayMutex.runExclusive(async () => {
        const entry = await resolve(filePath);
        if (entry?.type !== 'file') return err('ENOENT');

        const { metadata, contentBasePath } = entry;

        // contents are in the base (i.e., on the server)
        if (contentBasePath) {
            const getObjectURL = () => pathToRemoteURL(contentBasePath);
            return ok({ metadata, contents: () => fetchBaseData(contentBasePath), getObjectURL });
        }

        const buffer = await readOverlayData(filePath);

        let cachedObjectURL = '';
        const getObjectURL = () => {
            if (!cachedObjectURL) cachedObjectURL = URL.createObjectURL(new Blob([buffer]));
            return cachedObjectURL;
        };
        const revokeObjectURL = () => {
            if (cachedObjectURL) URL.revokeObjectURL(cachedObjectURL);
            cachedObjectURL = '';
        };

        return ok({ metadata, contents: async () => buffer, getObjectURL, revokeObjectURL });
    });
};
