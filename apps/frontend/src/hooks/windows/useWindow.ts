import { useShallow } from 'zustand/shallow';

import { useSystemStore } from '../system/useSystemStore';

import type { ProcessInfo } from '@/stores/system/processes/ProcessManager';
import type { WindowID, WindowInfo } from '@/stores/system/windows/WindowManager';

export const useWindow = (wid: WindowID): [WindowInfo, ProcessInfo] | undefined =>
    useSystemStore(
        useShallow(({ wm, pm }) => {
            const winfo = wm.windows.get(wid);
            if (!winfo) return undefined;

            return [winfo, pm.processes.get(winfo.pid)!] as const;
        }),
    );
