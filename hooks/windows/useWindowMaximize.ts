import {
  useWindowManager,
  WindowID,
} from '@/components/contexts/WindowManagerContext';

export const useWindowMaximize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) =>
    updateWindowManager({ action: 'toggle_maximized', wid });
};
