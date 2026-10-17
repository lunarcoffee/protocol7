import { normalizePath } from '../internal';
import { resolve } from '../resolve';
import { type Result, err, ok } from '@/utils/Result';

import type { FsEntryMetadata } from '@protocol7/filesystem-types';

export type ReadMetadataSuccess = { metadata: FsEntryMetadata };
export type ReadMetadataError = 'ENOENT';

export type ReadMetadataResult = Result<ReadMetadataSuccess, string>;

export const readMetadata = async (entryPath: string): Promise<ReadMetadataResult> => {
    const entry = await resolve(normalizePath(entryPath));
    return entry ? ok({ metadata: entry.metadata }) : err('ENOENT');
};
