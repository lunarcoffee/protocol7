'use client';

import { configureSingle } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { enableMapSet } from 'immer';
import { useEffect } from 'react';

import { useBoolean } from '@/hooks/useBoolean';

import { RemoteViewer } from './RemoteViewer';

enableMapSet();

export const App = () => {
    const [isZenFsInitialized, setZenFsInitialized, setZenFsNotInitialized] = useBoolean();

    useEffect(() => {
        const initializeZenFS = async () => {
            await configureSingle({ backend: IndexedDB, disableAsyncCache: true });
            setZenFsInitialized();
        };

        setZenFsNotInitialized();
        initializeZenFS();
        // `useBoolean` setters are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isZenFsInitialized && <RemoteViewer />;
};
