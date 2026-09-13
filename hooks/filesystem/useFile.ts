import { useEffect, useState } from 'react';

import { useSystemHostname } from '@/hooks/system';
import { useToggle } from '@/hooks/useToggle';
import { openFile } from '@/utils/filesystem/openFile';
import { OpenFileResult } from '@/utils/filesystem/openFile';

export interface UseFileOptions {
    noFetch?: boolean;
}

export type RefreshTrigger = () => void;

type UseFileResult = [OpenFileResult | undefined, RefreshTrigger];

export const useFile = (filePath: string, options: UseFileOptions = {}): UseFileResult => {
    const hostname = useSystemHostname();

    const [handle, setHandle] = useState<OpenFileResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await openFile(filePath, hostname, options);
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [filePath, hostname, options, refreshSignal]);

    return [handle, triggerRefresh];
};
