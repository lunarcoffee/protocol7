import type { JSX, PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { eraseOverlay } from '@/filesystem/api/eraseOverlay';
import { fetchManifest } from '@/filesystem/manifest';
import { useBoolean } from '@/hooks/useBoolean';
import { createSystemStore, SystemStoreAPI } from '@/stores/system/store';

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
            try {
                await eraseOverlay(hostname);
            } catch (err) {
                console.error(`fs: exception while erasing overlay for host ${hostname}!`, err);
                // TODO: tf do we do here lol reload the page?
            }
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
