import { windowDestroy } from '../windows/updateWindowManager';
import { readFile } from '@/filesystem/api/readFile';
import { writeFile } from '@/filesystem/api/writeFile';

import type { System, SystemStore } from '../store';
import type { WindowID } from '../windows/WindowManager';
import type { ProcessID, ProcessInfo, ProcessManager, ProcessSettings } from './ProcessManager';
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

/* process settings utilties */

const processSettingsPath = (pname: string) => `/system/programs/${pname}/settings.json`;

const parseProcessSettings = <T>(json: string): ProcessSettings<T> =>
    JSON.parse(json, (_, value) =>
        typeof value === 'object' && '_type' in value && value['_type'] === 'map'
            ? new Map(Object.entries(value['_value']))
            : value,
    );

const stringifyProcessSettings = <T>(settings: ProcessSettings<T>) =>
    JSON.stringify(settings, (_, value) =>
        value instanceof Map ? { _type: 'map', _value: Object.fromEntries(value.entries()) } : value,
    );

export const readProcessSettings = async (pname: string) => {
    const settingsFilePath = processSettingsPath(pname);
    const settingsFile = await readFile(settingsFilePath);
    if (!settingsFile?.ok) return console.error(`pm: failed to read app settings for ${pname}`);

    const contents = new TextDecoder().decode(await settingsFile.contents());
    return parseProcessSettings(contents);
};

export const makeSaveSettings =
    (pname: string) =>
    <T>(settings: ProcessSettings<T>) =>
        writeFile(processSettingsPath(pname), stringifyProcessSettings(settings));

/* process manager actions */

type RequiredProcessProps = 'pid' | 'pname';
type OptionalProcessProps = 'isHeadless';

export type ProcessCreationInfo = Pick<ProcessInfo, RequiredProcessProps> &
    Partial<Pick<ProcessInfo, OptionalProcessProps>>;

export type ImmerSetter = (updater: (state: Draft<SystemStore>) => void) => void;

export const processCreate = async (info: ProcessCreationInfo, set: ImmerSetter, signal?: AbortSignal) => {
    const { pid, pname } = info;

    const settings = await readProcessSettings(pname);
    if (!settings || signal?.aborted) return;

    set(({ pm: { processes } }) => {
        if (processes.has(pid)) console.warn(`pm: recreating existing pid ${pid}`);

        processes.set(pid, {
            windows: [],
            isHeadless: false,

            settings,
            getSettings: <T>() => settings as ProcessSettings<T>,
            saveSettings: makeSaveSettings(pname),

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

export const processReloadSettings = async ({ processes }: ProcessManager, pid: ProcessID, set: ImmerSetter) => {
    const process = processes.get(pid);
    if (!process) return;

    const settings = await readProcessSettings(process.pname);
    if (!settings) return;

    set(({ pm: { processes } }) => {
        const process = processes.get(pid);
        if (!process) return;

        process.settings = settings;
        process.getSettings = <T>() => settings as ProcessSettings<T>;
        process.saveSettings = makeSaveSettings(process.pname);
    });
};
