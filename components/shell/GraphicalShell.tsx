import { useEffect } from 'react';

import { Desktop } from './desktop/Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { WindowLayer } from './WindowLayer';
import { useCreateProcess, useDestroyProcess } from '@/hooks/processes';
import { useCreateWindow } from '@/hooks/windows';
import { PID_SHELL } from '@/stores/system/processes/ProcessManager';
import { WID_DESKTOP, WID_TASKBAR } from '@/stores/system/windows/WindowManager';
import { SHELL_ROOT_ELEMENT_ID } from '@/utils/getShellRootElement';

export const GraphicalShell = () => {
    const createProcess = useCreateProcess();
    const destroyProcess = useDestroyProcess();
    const createWindow = useCreateWindow();

    // spawn core shell apps
    useEffect(() => {
        createProcess({ pid: PID_SHELL, isHeadless: true });

        createWindow({ pid: PID_SHELL, wid: WID_TASKBAR, render: () => <Taskbar /> });
        createWindow({ pid: PID_SHELL, wid: WID_DESKTOP, render: (windowInfo) => <Desktop windowInfo={windowInfo} /> });

        return () => destroyProcess(PID_SHELL);
    }, [createProcess, createWindow, destroyProcess]);

    return (
        <div id={SHELL_ROOT_ELEMENT_ID} className="size-full">
            <WindowLayer />
        </div>
    );
};
