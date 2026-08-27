'use client';

import { enableMapSet } from 'immer';
import { useEffect } from 'react';

import { useProcessManager } from '@/hooks/useProcessManager';
import { useWindowManager } from '@/hooks/useWindowManager';

import { PID_SHELL } from '../contexts/system/processes/ProcessManager';
import { WID_DESKTOP, WID_TASKBAR } from '../contexts/system/windows/WindowManager';
import { Desktop } from './desktop/Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { WindowLayer } from './WindowLayer';

enableMapSet();

export const GraphicalShell = () => {
    const pm = useProcessManager();
    const wm = useWindowManager();

    // spawn core shell apps
    useEffect(() => {
        pm.create({ pid: PID_SHELL, isHeadless: true });

        wm.create({
            pid: PID_SHELL,
            wid: WID_TASKBAR,
            render: () => <Taskbar />,
        });
        wm.create({
            pid: PID_SHELL,
            wid: WID_DESKTOP,
            render: (windowInfo) => <Desktop windowInfo={windowInfo} />,
        });

        return () => pm.destroy(PID_SHELL);
        // wm/pm actions only use reducer dispatches which are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <WindowLayer />;
};
