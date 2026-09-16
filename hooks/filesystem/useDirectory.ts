import { useEffect, useState } from 'react';

import { ReadDirectoryResult } from '@/utils/filesystem/api/readDirectory';
import { readDirectory } from '@/utils/filesystem/api/readDirectory';

import { useSystemHostname } from '../system';
import { useToggle } from '../useToggle';
import { RefreshTrigger } from './useFile';

export type UseDirectoryResult = [ReadDirectoryResult | undefined, RefreshTrigger];

export const useDirectory = (dirPath: string): UseDirectoryResult => {
    const hostname = useSystemHostname();

    const [handle, setHandle] = useState<ReadDirectoryResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await readDirectory(dirPath);
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [hostname, dirPath, refreshSignal]);

    return [handle, triggerRefresh];
};
