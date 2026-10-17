import { useShallow } from 'zustand/react/shallow';

import { useSystemStore } from '../system/useSystemStore';

import type { WindowID } from '@/stores/system/windows/WindowManager';

export const useWindowIDs = (): WindowID[] => useSystemStore(useShallow(({ wm }) => Array.from(wm.windows.keys())));
