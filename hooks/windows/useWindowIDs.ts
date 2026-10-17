import { useShallow } from 'zustand/react/shallow';

import { useSystemStore } from '../system/useSystemStore';
import { WindowID } from '@/stores/system/windows/WindowManager';

export const useWindowIDs = (): WindowID[] => useSystemStore(useShallow(({ wm }) => Array.from(wm.windows.keys())));
