import { WindowID, WindowInfo } from '@/stores/system/windows/WindowManager';

import { useSystemStore } from '../system/useSystemStore';

export const useWindow = (wid: WindowID): WindowInfo | undefined => useSystemStore(({ wm }) => wm.windows.get(wid));
