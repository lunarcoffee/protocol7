import { useEffect, useState } from 'react';

import { openDirectory, OpenDirectoryResult } from '@/utils/filesystem/openDirectory';

import { useSystemHostname } from '../system';
import { useToggle } from '../useToggle';
import { RefreshTrigger } from './useFile';

export type UseDirectoryResult = [OpenDirectoryResult | undefined, RefreshTrigger];

export const useDirectory = (dirPath: string): UseDirectoryResult => {
    const hostname = useSystemHostname();

    const [handle, setHandle] = useState<OpenDirectoryResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await openDirectory(dirPath, hostname);
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [hostname, dirPath, refreshSignal]);

    return [handle, triggerRefresh];
};
