import {
  useWindowManager,
  WindowID,
} from '@/components/contexts/WindowManagerContext';

export const useWindowMinimize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'minimize', wid });
};
