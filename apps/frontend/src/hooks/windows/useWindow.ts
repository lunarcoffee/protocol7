import { useSystemStore } from '../system/useSystemStore';

import type { WindowID, WindowInfo } from '@/stores/system/windows/WindowManager';

export const useWindow = (wid: WindowID): WindowInfo | undefined => useSystemStore(({ wm }) => wm.windows.get(wid));
