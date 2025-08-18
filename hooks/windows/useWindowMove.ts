import {
  Dimensions,
  WindowID,
} from '@/components/contexts/system/WindowManager';

import { useWindowManager } from './useWindowManager';

export const useWindowMove = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID, position: Dimensions) =>
    updateWindowManager({ action: 'move', wid, position });
};
