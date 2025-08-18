import { WindowID } from '@/components/contexts/system/WindowManager';

import { useWindowManager } from './useWindowManager';

export const useWindowDestroy = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'destroy', wid });
};
