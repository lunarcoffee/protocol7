import { immer } from 'zustand/middleware/immer';
import { type StoreApi, createStore } from 'zustand/vanilla';

import { DEFAULT_PROCESS_MANAGER, type ProcessID, type ProcessManager } from './processes/ProcessManager';
import {
    type ProcessCreationInfo,
    processCreate,
    processDestroy,
    processReloadSettings,
} from './processes/updateProcessManager';
import {
    type WindowCreationInfo,
    windowCreate,
    windowDestroy,
    windowFocus,
    windowMinimize,
    windowMove,
    windowResize,
    windowSetTitle,
    windowToggleMaximized,
} from './windows/updateWindowManager';
import { DEFAULT_WINDOW_MANAGER, type WindowID, type WindowManager } from './windows/WindowManager';

import type { Dimensions } from '@/utils/Dimensions';
import type { RemoteFsManifest } from '@protocol7/filesystem-types';

export interface System {
    hostname: string;
    fileManifest: RemoteFsManifest;

    pm: ProcessManager;
    wm: WindowManager;
}

export interface SystemStore extends System {
    createProcess: (info: ProcessCreationInfo, signal?: AbortSignal) => Promise<void>;
    destroyProcess: (pid: ProcessID) => void;
    reloadProcessSettings: (pid: ProcessID) => Promise<void>;

    createWindow: (info: WindowCreationInfo) => void;
    destroyWindow: (wid: WindowID) => void;
    moveWindow: (wid: WindowID, position: Dimensions) => void;
    resizeWindow: (wid: WindowID, size: Dimensions, fixRight: boolean, fixBottom: boolean) => void;
    minimizeWindow: (wid: WindowID) => void;
    toggleMaximizedWindow: (wid: WindowID) => void;
    focusWindow: (wid: WindowID) => void;
    setTitleWindow: (wid: WindowID, title: string) => void;
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
        immer((set, get) => ({
            ...createInitialSystem(hostname, fileManifest),

            createProcess: (info, signal) => processCreate(info, set, signal),
            destroyProcess: (pid) => set((system) => processDestroy(system, pid)),
            reloadProcessSettings: (pid) => processReloadSettings(get().pm, pid, set),

            createWindow: (info) => set((system) => windowCreate(system, info)),
            destroyWindow: (wid) => set((system) => windowDestroy(system, wid)),
            moveWindow: (wid, position) => set(({ wm }) => windowMove(wm, wid, position)),
            resizeWindow: (wid, size, fixRight, fixBottom) =>
                set(({ wm }) => windowResize(wm, wid, size, fixRight, fixBottom)),
            minimizeWindow: (wid) => set((system) => windowMinimize(system, wid)),
            toggleMaximizedWindow: (wid) => set((system) => windowToggleMaximized(system, wid)),
            focusWindow: (wid) => set((system) => windowFocus(system, wid)),
            setTitleWindow: (wid, title) => set(({ wm }) => windowSetTitle(wm, wid, title)),
        })),
    );
