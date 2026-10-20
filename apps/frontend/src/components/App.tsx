'use client';

import { configureSingle } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { enableMapSet } from 'immer';
import { useEffect } from 'react';

import { RemoteViewer } from './remoteViewer/RemoteViewer';
import { useBoolean } from '@/hooks/useBoolean';
import { addMousePositionListener } from '@/utils/getMousePosition';

enableMapSet();

export const App = () => {
    const [isZenFsInitialized, setZenFsInitialized, setZenFsNotInitialized] = useBoolean();

    useEffect(() => {
        const initializeZenFS = async () => {
            await configureSingle({ backend: IndexedDB, disableAsyncCache: true });
            setZenFsInitialized();
        };

        setZenFsNotInitialized();
        void initializeZenFS();

        addMousePositionListener();
    }, [setZenFsInitialized, setZenFsNotInitialized]);

    return isZenFsInitialized && <RemoteViewer />;
};
