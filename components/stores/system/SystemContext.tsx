import { configureSingle } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import type { JSX, PropsWithChildren } from 'react';
import { createContext, useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand/vanilla';

import { useBoolean } from '@/hooks/useBoolean';

import { createSkeletonForHost, eraseHostFiles } from './filesystem';
import { createSystemStore, SystemStore } from './store';

export const SystemStoreContext = createContext<StoreApi<SystemStore> | null>(null);

export interface SystemContextProviderProps extends PropsWithChildren {
    hostname: string;
    fallback: JSX.Element;
}

export const SystemContextProvider = ({ hostname, fallback, children }: SystemContextProviderProps) => {
    const storeRef = useRef<StoreApi<SystemStore>>(null);
    if (!storeRef.current) storeRef.current = createSystemStore(hostname);
    const store = storeRef.current;

    const [isFsReady, setFsReady, setFsNotReady] = useBoolean();

    useEffect(() => {
        const initializeFilesystem = async () => {
            // TODO: try to only call this once per application, not once per host
            await configureSingle({ backend: IndexedDB });

            await eraseHostFiles(hostname); // TODO: only for debug
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
