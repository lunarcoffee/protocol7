import { useShallow } from 'zustand/react/shallow';

import { WindowID } from '@/stores/system/windows/WindowManager';

import { useSystemStore } from '../system/useSystemStore';

export const useWindowIDs = (): WindowID[] => useSystemStore(useShallow(({ wm }) => Array.from(wm.windows.keys())));
