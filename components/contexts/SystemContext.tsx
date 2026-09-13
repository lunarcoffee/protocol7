import type { JSX, PropsWithChildren } from 'react';
import { createContext, useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand/vanilla';

import { useBoolean } from '@/hooks/useBoolean';
import { createSystemStore, SystemStore } from '@/stores/system/store';
import { createSkeletonForHost, eraseDataForHost } from '@/utils/filesystem';

export const SystemStoreContext = createContext<StoreApi<SystemStore> | null>(null);

export interface SystemContextProviderProps extends PropsWithChildren {
    hostname: string;
    fallback: JSX.Element;
}

export const SystemContextProvider = ({ hostname, fallback, children }: SystemContextProviderProps) => {
    const storeRef = useRef<StoreApi<SystemStore>>(null);
    if (!storeRef.current) storeRef.current = createSystemStore(hostname); // TODO: new store when hostname changes
    const store = storeRef.current;

    const [isFsReady, setFsReady, setFsNotReady] = useBoolean();

    useEffect(() => {
        const initializeFilesystem = async () => {
            eraseDataForHost(hostname); // TODO: only for debug
            await createSkeletonForHost(hostname);

            setFsReady();
        };

        setFsNotReady();
        initializeFilesystem();
        // `useBoolean` setters are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostname]);

    return <SystemStoreContext.Provider value={store}>{isFsReady ? children : fallback}</SystemStoreContext.Provider>;
};
