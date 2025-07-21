import {
  Dimensions,
  useWindowManager,
  WindowID,
} from '@/components/contexts/WindowManagerContext';

export const useWindowResize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID, size: Dimensions, shiftX: boolean, shiftY: boolean) =>
    updateWindowManager({ action: 'resize', wid, size, shiftX, shiftY });
};
