import { Desktop } from './desktop/Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { WindowLayer } from './WindowLayer';
import { useCreateProcess, useDestroyProcess } from '@/hooks/processes';
import { usePromise } from '@/hooks/usePromise';
import { useCreateWindow } from '@/hooks/windows';
import { PID_SHELL, PNAME_SHELL } from '@/stores/system/processes/ProcessManager';
import { WID_DESKTOP, WID_TASKBAR } from '@/stores/system/windows/WindowManager';
import { SHELL_ROOT_ELEMENT_ID } from '@/utils/getShellRootElement';

export const GraphicalShell = () => {
    const createProcess = useCreateProcess();
    const destroyProcess = useDestroyProcess();
    const createWindow = useCreateWindow();

    // spawn core shell apps
    usePromise(
        async (signal) => {
            await createProcess({ pid: PID_SHELL, pname: PNAME_SHELL, isHeadless: true }, signal);
            if (signal.aborted) return;

            createWindow({ pid: PID_SHELL, wid: WID_TASKBAR, render: () => <Taskbar /> });
            createWindow({
                pid: PID_SHELL,
                wid: WID_DESKTOP,
                render: (windowInfo) => <Desktop windowInfo={windowInfo} />,
            });
        },
        [createProcess, createWindow],
        () => destroyProcess(PID_SHELL),
    );

    return (
        <div id={SHELL_ROOT_ELEMENT_ID} className="size-full">
            <WindowLayer />
        </div>
    );
};
