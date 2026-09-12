import { Draft } from 'immer';

import type { System } from '../store';
import { windowDestroy } from '../windows/updateWindowManager';
import { WindowID } from '../windows/WindowManager';
import { ProcessID, ProcessInfo, ProcessManager } from './ProcessManager';

/* process manager helpers */

export const processAttachWindow = ({ processes }: Draft<ProcessManager>, pid: ProcessID, wid: WindowID) => {
    const process = processes.get(pid);
    if (process) process.windows.push(wid);
};

// detach a window from `pid` and destroy it if no windows remain (unless `pid` is headless)
export const processDetachWindow = (system: Draft<System>, pid: ProcessID, wid: WindowID) => {
    const process = system.pm.processes.get(pid);
    if (process) {
        const index = process.windows.indexOf(wid);
        if (index >= 0) process.windows.splice(index, 1);
        if (!process.windows.length && !process.isHeadless) processDestroy(system, pid);
    }
};

/* process manager actions */

type RequiredProcessProps = 'pid';

export type ProcessCreationInfo = Pick<ProcessInfo, RequiredProcessProps> &
    Partial<Omit<ProcessInfo, RequiredProcessProps>>;

export const processCreate = ({ processes }: Draft<ProcessManager>, info: ProcessCreationInfo) => {
    const { pid } = info;

    if (processes.has(pid)) console.warn('recreating existing pid:', pid);

    processes.set(pid, {
        windows: [],
        isHeadless: false,
        ...info,
    });
};

// destroy `pid` and all of its windows
export const processDestroy = (system: Draft<System>, pid: ProcessID) => {
    const {
        pm: { processes },
    } = system;

    const process = processes.get(pid);
    if (process) {
        processes.delete(pid);
        process.windows.forEach((wid) => windowDestroy(system, wid));
    }
};
