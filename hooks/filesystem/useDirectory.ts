import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';
import { useCallback, useEffect, useState } from 'react';

import { OpenDirectoryResult } from '@/utils/filesystem';

import { useSystemHostname } from '../system';
import { useToggle } from '../useToggle';
import { RefreshTrigger } from './useFile';

export type UseDirectoryResult = [OpenDirectoryResult | undefined, RefreshTrigger];

export const useDirectory = (path: PathLike): UseDirectoryResult => {
    const hostname = useSystemHostname();
    const hostQualifiedPath = `${hostname}/${path}`;

    const [handle, setHandle] = useState<OpenDirectoryResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    const openDirectory = useCallback(async (): Promise<OpenDirectoryResult> => {
        const dirents = await fs.readdir(hostQualifiedPath).catch(() => null);
        if (!dirents) return { error: 'not found', ok: false };

        dirents.sort();

        return {
            entries: () => dirents,
            entriesAbsolute: () => dirents.map((dirent) => `${path}/${dirent}`),
            ok: true,
        };
        // `refreshSignal` allows a consumer to manually trigger a reread of the directory contents
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, hostQualifiedPath, refreshSignal]);

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await openDirectory();
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [openDirectory]);

    return [handle, triggerRefresh];
};
