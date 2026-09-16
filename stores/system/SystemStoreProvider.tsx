import type { JSX, PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useBoolean } from '@/hooks/useBoolean';
import { createSystemStore, SystemStoreAPI } from '@/stores/system/store';
import { fetchManifest, resetLocalFilesystem } from '@/utils/filesystem';

export let systemStore: SystemStoreAPI | null = null;

export interface SystemStoreProviderProps extends PropsWithChildren {
    hostname: string;
    fallback: JSX.Element;
}

export const SystemStoreProvider = ({ hostname, fallback, children }: SystemStoreProviderProps) => {
    const [isSystemReady, setSystemReady, setSystemNotReady] = useBoolean();

    useEffect(() => {
        let canceled = false;
        const initializeFilesystem = async () => {
            await resetLocalFilesystem(hostname);
            const fileManifest = await fetchManifest(hostname);

            if (!canceled && fileManifest) {
                systemStore = createSystemStore(hostname, fileManifest);
                setSystemReady();
            }
        };

        setSystemNotReady();
        initializeFilesystem();

        return () => {
            canceled = true;
        };
        // `useBoolean` setters are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostname]);

    return isSystemReady ? children : fallback;
};
