import {
  Dimensions,
  WindowID,
} from '@/components/contexts/system/WindowManager';

import { useWindowManager } from './useWindowManager';

export const useWindowResize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID, size: Dimensions, shiftX: boolean, shiftY: boolean) =>
    updateWindowManager({ action: 'resize', wid, size, shiftX, shiftY });
};
