import { WindowID } from '@/components/contexts/system/WindowManager';

import { useWindowManager } from './useWindowManager';

export const useWindowMaximize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) =>
    updateWindowManager({ action: 'toggle_maximized', wid });
};
