import { WindowManagerDispatchAction } from '@/components/contexts/system/updateWindowManager';
import { WindowManager } from '@/components/contexts/system/WindowManager';

import { useSystem } from '../useSystem';

export type WindowManagerDispatch = (
  action: WindowManagerDispatchAction,
) => void;

export const useWindowManager = (): [WindowManager, WindowManagerDispatch] => {
  const [{ wm }, dispatch] = useSystem();
  return [
    wm,
    (action: WindowManagerDispatchAction) =>
      dispatch({ type: 'window', action }),
  ];
};
