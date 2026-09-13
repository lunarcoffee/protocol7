import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';
import { useCallback, useEffect, useState } from 'react';

import { useSystemHostname } from '@/hooks/system';
import { useToggle } from '@/hooks/useToggle';

import { fetchFileForHost, FS_SKELETON_PLACEHOLDER, OpenFileResult } from '../../utils/filesystem';

export interface UseFileOptions {
    noFetch?: boolean;
}

export type RefreshTrigger = () => void;

type UseFileResult = [OpenFileResult | undefined, RefreshTrigger];

export const useFile = (path: PathLike, { noFetch }: UseFileOptions = {}): UseFileResult => {
    const hostname = useSystemHostname();
    const hostQualifiedPath = `${hostname}/${path}`;

    const [handle, setHandle] = useState<OpenFileResult>();
    const [refreshSignal, triggerRefresh] = useToggle();

    const openFile = useCallback(async (): Promise<OpenFileResult> => {
        let buffer = await fs.readFile(hostQualifiedPath).catch(() => null);
        if (!buffer) return { error: 'not found', ok: false };

        // current file is a placeholder from the skeleton; need to fetch actual contents
        if (!noFetch && buffer.readUint32BE() === FS_SKELETON_PLACEHOLDER) {
            const hostFile = await fetchFileForHost(hostname, path);
            if (!hostFile) {
                await fs.rm(hostQualifiedPath, { force: true });
                return { error: 'not found', ok: false };
            }
            buffer = hostFile;
        }

        // for elements taking URLs (e.g. <img>)
        const blob = new Blob([Buffer.from(buffer)]);
        const objectURL = URL.createObjectURL(blob);

        return {
            read: () => buffer,
            readToObjectURL: () => objectURL,
            ok: true,
        };
        // `refreshSignal` allows a consumer to manually trigger a reread of the file contents
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostQualifiedPath, refreshSignal, noFetch]);

    useEffect(() => {
        let canceled = false;

        const loadHandle = async () => {
            const file = await openFile();
            if (!canceled) setHandle(file);
        };
        loadHandle();

        return () => {
            canceled = true;
        };
    }, [openFile]);

    return [handle, triggerRefresh];
};
