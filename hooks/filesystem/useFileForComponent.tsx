import { PathLike } from 'fs';
import { JSX } from 'react';

import { FileHandle } from '@/components/contexts/system/filesystem';

import { useFile, UseFileOptions, UseFileOtherCallbacks } from './useFile';

// convenience wrapper with empty fragment defaults for non-success states
export const useFileForComponent = (
    path: PathLike,
    success: (handle: FileHandle) => JSX.Element,
    { loading, error }: Partial<UseFileOtherCallbacks<JSX.Element, JSX.Element>> = {},
    options: UseFileOptions = { noFetch: false },
) =>
    useFile(
        path,
        success,
        {
            loading: loading || <></>,
            error: error || (() => <></>),
        },
        options,
    );
