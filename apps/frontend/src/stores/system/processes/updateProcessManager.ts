import { windowDestroy } from '../windows/updateWindowManager';
import { readFile } from '@/filesystem/api/readFile';

import type { System, SystemStore } from '../store';
import type { WindowID } from '../windows/WindowManager';
import type { AppSettings, ProcessID, ProcessInfo, ProcessManager } from './ProcessManager';
import type { Draft } from 'immer';

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

type RequiredProcessProps = 'pid' | 'pname';
type OptionalProcessProps = 'isHeadless';

export type ProcessCreationInfo = Pick<ProcessInfo, RequiredProcessProps> &
    Partial<Pick<ProcessInfo, OptionalProcessProps>>;

export const processCreate = async (
    info: ProcessCreationInfo,
    set: (updater: (state: Draft<SystemStore>) => void) => void,
    signal?: AbortSignal,
) => {
    const { pid, pname } = info;

    const appSettingsFile = await readFile(`/system/programs/${pname}/settings.json`);
    if (!appSettingsFile?.ok) return console.error(`pm: failed to read app settings for ${pname}`);

    const contents = new TextDecoder().decode(await appSettingsFile.contents());
    const appSettings = JSON.parse(contents);

    if (signal?.aborted) return;

    set(({ pm: { processes } }) => {
        if (processes.has(pid)) console.warn(`pm: recreating existing pid ${pid}`);

        processes.set(pid, {
            windows: [],
            isHeadless: false,

            appSettings,
            getAppSettings: <T extends Record<string, any>>() => appSettings as AppSettings<T>,

            ...info,
        });
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
