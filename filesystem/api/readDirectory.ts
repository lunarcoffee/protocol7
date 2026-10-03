import { err, ok, Result } from '@/utils/Result';

import { FsDirectoryMetadata, FsEntryMetadata } from '..';
import { normalizePath } from '../internal';
import { overlayMutex } from '../overlay';
import { listDirectoryMerged, resolve } from '../resolve';

export type ReadDirectorySuccess = {
    metadata: FsDirectoryMetadata;
    entries: Record<string, FsEntryMetadata>;
};

export type ReadDirectoryError = 'ENOENT';

export type ReadDirectoryResult = Result<ReadDirectorySuccess, ReadDirectoryError>;

export const readDirectory = (dirPath: string): Promise<ReadDirectoryResult> => {
    dirPath = normalizePath(dirPath);

    return overlayMutex.runExclusive(async () => {
        const entry = await resolve(dirPath);
        if (entry?.type !== 'directory') return err('ENOENT');

        const entries = await listDirectoryMerged(dirPath, entry);
        return ok({ metadata: entry.metadata, entries });
    });
};
