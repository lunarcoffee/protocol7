import { configureSingle } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Draft } from 'immer';
import { createContext, JSX, PropsWithChildren, useEffect, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';

import { useBoolean } from '@/hooks/useBoolean';

import { createSkeletonForHost, eraseHostFiles } from './filesystem';
import { DEFAULT_PROCESS_MANAGER, ProcessManager } from './processes/ProcessManager';
import { ProcessManagerDispatchAction, updateProcessManager } from './processes/updateProcessManager';
import { updateWindowManager, WindowManagerDispatchAction } from './windows/updateWindowManager';
import { DEFAULT_WINDOW_MANAGER, WindowManager } from './windows/WindowManager';

export interface System {
    hostname: string;

    pm: ProcessManager;
    wm: WindowManager;
}

const DEFAULT_SYSTEM = {
    hostname: 'localhost',

    pm: DEFAULT_PROCESS_MANAGER,
    wm: DEFAULT_WINDOW_MANAGER,
};

export type SystemDispatchAction =
    | { type: 'process'; action: ProcessManagerDispatchAction }
    | { type: 'window'; action: WindowManagerDispatchAction };

export type SystemDispatch = (action: SystemDispatchAction) => void;

const updateSystem = (system: Draft<System>, { type, action }: SystemDispatchAction) => {
    switch (type) {
        case 'process':
            updateProcessManager(system, action);
            break;
        case 'window':
            updateWindowManager(system, action);
            break;
    }
};

export const SystemContext = createContext(DEFAULT_SYSTEM);

export const SystemDispatchContext = createContext<SystemDispatch>(() => {
    throw new Error('system context uninitialized!');
});

export interface SystemContextProviderProps extends PropsWithChildren {
    fallback: JSX.Element;
}

export const SystemContextProvider = ({ fallback, children }: SystemContextProviderProps) => {
    const [system, dispatch] = useImmerReducer(updateSystem, DEFAULT_SYSTEM);

    const hostname = useMemo(() => system.hostname, [system]);
    const [isFsReady, setFsReady, setFsNotReady] = useBoolean();

    useEffect(() => {
        const initializeFilesystem = async () => {
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

    return (
        <SystemContext.Provider value={system}>
            <SystemDispatchContext.Provider value={dispatch}>
                {isFsReady ? children : fallback}
            </SystemDispatchContext.Provider>
        </SystemContext.Provider>
    );
};
