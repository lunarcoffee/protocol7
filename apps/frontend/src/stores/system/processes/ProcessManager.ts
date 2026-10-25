import type { WindowID } from '../windows/WindowManager';

export type ProcessID = number;

export const PID_SHELL = 0;
export const PNAME_SHELL = 'shell';

export type AppSettings<T extends Record<string, any>> = { displayName: string; icon: string } & T;

export interface ProcessInfo {
    pid: ProcessID;
    pname: string;

    windows: WindowID[]; // a process owns any number of windows
    isHeadless: boolean; // headless processes don't die when their last window is destroyed

    appSettings: AppSettings<any>;
    getAppSettings: <T extends Record<string, any>>() => AppSettings<T>;
}

export interface ProcessManager {
    processes: Map<ProcessID, ProcessInfo>;
}

export const DEFAULT_PROCESS_MANAGER = { processes: new Map() };
