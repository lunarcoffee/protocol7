import { useEffect, useState } from 'react';

import { useSystemHostname } from '@/hooks/system';
import { useToggle } from '@/hooks/useToggle';
import { ReadFileResult } from '@/utils/filesystem/api/readFile';
import { readFile } from '@/utils/filesystem/api/readFile';

export type RefreshTrigger = () => void;

type UseFileResult = [ReadFileResult | undefined, RefreshTrigger];

export const useFile = (filePath: string): UseFileResult => {
    const hostname = useSystemHostname();

    const [handle, setHandle] = useState<ReadFileResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
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
