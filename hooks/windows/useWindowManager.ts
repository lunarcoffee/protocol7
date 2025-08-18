import {
  WindowManager,
  WindowManagerDispatch,
  WindowManagerDispatchAction,
} from '@/components/contexts/system/WindowManager';

import { useSystem } from '../useSystem';

export const useWindowManager = (): [WindowManager, WindowManagerDispatch] => {
  const [{ wm }, dispatch] = useSystem();
  return [
    wm,
    (action: WindowManagerDispatchAction) => {
      dispatch({ type: 'window', action });
    },
  ];
};
