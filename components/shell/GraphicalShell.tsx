'use client';

import { useEffect } from 'react';

import { useCreateProcess, useDestroyProcess } from '@/hooks/useProcessManager';
import { useCreateWindow } from '@/hooks/useWindowManager';
import { PID_SHELL } from '@/stores/system/processes/ProcessManager';
import { WID_DESKTOP, WID_TASKBAR } from '@/stores/system/windows/WindowManager';

import { Desktop } from './desktop/Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { WindowLayer } from './WindowLayer';

export const GraphicalShell = () => {
    const createProcess = useCreateProcess();
    const destroyProcess = useDestroyProcess();
    const createWindow = useCreateWindow();

    // spawn core shell apps
    useEffect(() => {
        createProcess({ pid: PID_SHELL, isHeadless: true });

        createWindow({
            pid: PID_SHELL,
            wid: WID_TASKBAR,
            render: () => <Taskbar />,
        });
        createWindow({
            pid: PID_SHELL,
            wid: WID_DESKTOP,
            render: (windowInfo) => <Desktop windowInfo={windowInfo} />,
        });

        return () => destroyProcess(PID_SHELL);
        // store actions are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <WindowLayer />;
};
