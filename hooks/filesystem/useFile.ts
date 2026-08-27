import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    fetchFileFromHost,
    FileHandle,
    FS_SKELETON_PLACEHOLDER,
    OpenFileResult,
} from '@/components/contexts/system/filesystem';
import { useBoolean } from '@/hooks/useBoolean';
import { useSystem } from '@/hooks/useSystem';
import { useToggle } from '@/hooks/useToggle';

export interface UseFileOptions {
    noFetch?: boolean;
}

export type RefreshTrigger = () => void;

// actual file loading result, loading flag, and refresh trigger
type UseFileResult = [OpenFileResult | undefined, boolean, RefreshTrigger];

const useFileOrFetch = (path: PathLike, { noFetch }: UseFileOptions): UseFileResult => {
    const [system] = useSystem();
    const hostname = useMemo(() => system.hostname, [system]);
    const hostQualifiedPath = `${hostname}/${path}`;

    const [handle, setHandle] = useState<OpenFileResult>();
    const [isLoading, setLoading, setDone] = useBoolean(true);

    const [refreshSignal, triggerRefresh] = useToggle();

    const openFile = useCallback(async () => {
        let buffer = await fs.readFile(hostQualifiedPath).catch(() => null);
        if (!buffer) return 'not found';

        // current file is a placeholder from the skeleton; need to fetch actual contents
        if (!noFetch && buffer.readUint32BE() === FS_SKELETON_PLACEHOLDER) {
            const hostFile = await fetchFileFromHost(hostname, path);
            if (!hostFile) {
                await fs.rm(hostQualifiedPath, { force: true });
                return 'not found';
            }
            buffer = hostFile;
        }

        // for elements taking URLs (e.g. <img>)
        const blob = new Blob([Buffer.from(buffer)]);
        const objectURL = URL.createObjectURL(blob);

        return {
            read: () => buffer,
            readToObjectURL: () => objectURL,
        };
        // `refreshSignal` allows a consumer to manually trigger a reread of the file contents
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostQualifiedPath, refreshSignal, noFetch]);

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await openFile();
            if (!canceled) {
                setHandle(file);
                setDone();
            }
        };

        setLoading();
        loadHandle();

        return () => {
            canceled = true;
        };
        // `useBoolean` setters are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openFile]);

    return [handle, isLoading, triggerRefresh];
};

export interface UseFileOtherCallbacks<T, U> {
    loading: T;
    error: (error: string) => U;
}

export const useFile = <T, U, V>(
    path: PathLike,
    success: (handle: FileHandle) => T,
    { loading, error }: UseFileOtherCallbacks<U, V>,
    options: UseFileOptions = { noFetch: false },
): [T | U | V, RefreshTrigger] => {
    const [handle, isLoading, refresh] = useFileOrFetch(path, options);

    if (isLoading) return [loading, refresh];
    if (typeof handle === 'string') return [error(handle), refresh];

    // this should be safe; see the branching in the effect in `useFileOrFetch` above
    return [success(handle!), refresh];
};
