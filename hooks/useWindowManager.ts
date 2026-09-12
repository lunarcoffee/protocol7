import { useShallow } from 'zustand/react/shallow';

import { MIN_USER_WID, WindowID, WindowInfo } from '@/components/stores/system/windows/WindowManager';

import { useSystemStore } from './useSystem';

export const useWindow = (wid: WindowID): WindowInfo | undefined => useSystemStore(({ wm }) => wm.windows.get(wid));

export const useWindowIDs = (): WindowID[] => useSystemStore(useShallow(({ wm }) => Array.from(wm.windows.keys())));

export const useCreateWindow = () => useSystemStore(({ createWindow }) => createWindow);

export const useDestroyWindow = () => useSystemStore(({ destroyWindow }) => destroyWindow);

export const useMoveWindow = () => useSystemStore(({ moveWindow }) => moveWindow);

export const useResizeWindow = () => useSystemStore(({ resizeWindow }) => resizeWindow);

export const useMinimizeWindow = () => useSystemStore(({ minimizeWindow }) => minimizeWindow);

export const useMaximizeWindow = () => useSystemStore(({ toggleMaximizedWindow }) => toggleMaximizedWindow);

export const useFocusWindow = () => useSystemStore(({ focusWindow }) => focusWindow);

export const useNextWindowID = () => {
    const wids = useWindowIDs();

    let id = MIN_USER_WID;
    while (wids.includes(id)) id++;
    return id;
};
