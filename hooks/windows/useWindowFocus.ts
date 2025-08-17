import { WindowID } from '@/components/contexts/WindowManagerContext';

import { useWindowManager } from './useWindowManager';

export const useWindowFocus = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'focus', wid });
};
