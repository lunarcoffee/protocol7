import { WindowID } from '@/components/contexts/WindowManagerContext';

import { useWindowManager } from './useWindowManager';

export const useWindowMaximize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) =>
    updateWindowManager({ action: 'toggle_maximized', wid });
};
