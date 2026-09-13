import { PathLike } from 'fs';
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

export const useFile = (path: PathLike, options: UseFileOptions = {}): UseFileResult => {
    const hostname = useSystemHostname();

    const [handle, setHandle] = useState<OpenFileResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await openFile(path, hostname, options);
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [path, hostname, options, refreshSignal]);

    return [handle, triggerRefresh];
};
