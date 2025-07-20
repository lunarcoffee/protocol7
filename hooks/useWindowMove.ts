import {
  Dimensions,
  useWindowManager,
  WindowID,
} from '@/components/contexts/WindowManagerContext';

export const useWindowMove = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID, position: Dimensions) => {
    updateWindowManager({ action: 'move', wid, position });
  };
};
