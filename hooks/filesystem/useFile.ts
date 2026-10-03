import { useEffect, useState } from 'react';

import { ReadFileResult } from '@/filesystem/api/readFile';
import { readFile } from '@/filesystem/api/readFile';
import { useSystemHostname } from '@/hooks/system';
import { useToggle } from '@/hooks/useToggle';

export type RefreshTrigger = () => void;

type UseFileResult = [ReadFileResult | undefined, RefreshTrigger];

export const useFile = (filePath: string): UseFileResult => {
    const hostname = useSystemHostname();

    const [handle, setHandle] = useState<ReadFileResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            // TODO: maybe return a proxy to stop leaking object URLs
            const file = await readFile(filePath);
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [filePath, hostname, refreshSignal]);

    return [handle, triggerRefresh];
};
