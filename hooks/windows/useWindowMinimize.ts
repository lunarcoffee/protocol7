import { WindowID } from '@/components/contexts/system/WindowManager';

import { useWindowManager } from './useWindowManager';

export const useWindowMinimize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'minimize', wid });
};
