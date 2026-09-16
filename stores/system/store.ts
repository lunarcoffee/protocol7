import { immer } from 'zustand/middleware/immer';
import { createStore, StoreApi } from 'zustand/vanilla';

import { Dimensions } from '@/utils/Dimensions';
import { RemoteFsManifest } from '@/utils/filesystem';

import { DEFAULT_PROCESS_MANAGER, ProcessID, ProcessManager } from './processes/ProcessManager';
import { processCreate, ProcessCreationInfo, processDestroy } from './processes/updateProcessManager';
import {
    windowCreate,
    WindowCreationInfo,
    windowDestroy,
    windowFocus,
    windowMinimize,
    windowMove,
    windowResize,
    windowToggleMaximized,
} from './windows/updateWindowManager';
import { DEFAULT_WINDOW_MANAGER, WindowID, WindowManager } from './windows/WindowManager';

export interface System {
    hostname: string;
    fileManifest: RemoteFsManifest;

    pm: ProcessManager;
    wm: WindowManager;
}

export interface SystemStore extends System {
    createProcess(info: ProcessCreationInfo): void;
    destroyProcess(pid: ProcessID): void;

    createWindow(info: WindowCreationInfo): void;
    destroyWindow(wid: WindowID): void;
    moveWindow(wid: WindowID, position: Dimensions): void;
    resizeWindow(wid: WindowID, size: Dimensions, fixRight: boolean, fixBottom: boolean): void;
    minimizeWindow(wid: WindowID): void;
    toggleMaximizedWindow(wid: WindowID): void;
    focusWindow(wid: WindowID): void;
}

export type SystemStoreAPI = StoreApi<SystemStore>;

const createInitialSystem = (hostname: string, fileManifest: RemoteFsManifest): System => ({
    hostname,
    fileManifest,

    pm: DEFAULT_PROCESS_MANAGER,
    wm: DEFAULT_WINDOW_MANAGER,
});

export const createSystemStore = (hostname: string, fileManifest: RemoteFsManifest): SystemStoreAPI =>
    createStore<SystemStore>()(
        immer((set) => ({
            ...createInitialSystem(hostname, fileManifest),

            createProcess: (info) => set((system) => processCreate(system.pm, info)),
            destroyProcess: (pid) => set((system) => processDestroy(system, pid)),

            createWindow: (info) => set((system) => windowCreate(system, info)),
            destroyWindow: (wid) => set((system) => windowDestroy(system, wid)),
            moveWindow: (wid, position) => set((system) => windowMove(system.wm, wid, position)),
            resizeWindow: (wid, size, fixRight, fixBottom) =>
                set((system) => windowResize(system.wm, wid, size, fixRight, fixBottom)),
            minimizeWindow: (wid) => set((system) => windowMinimize(system, wid)),
            toggleMaximizedWindow: (wid) => set((system) => windowToggleMaximized(system, wid)),
            focusWindow: (wid) => set((system) => windowFocus(system, wid)),
        })),
    );
