import { WindowID } from '@/components/contexts/WindowManagerContext';

import { useProcessManager } from '../processes/useProcessManager';
import { useWindowManager } from './useWindowManager';

export const useWindowDestroy = () => {
  const [{ windows }, updateWindowManager] = useWindowManager();
  const [, updateProcessManager] = useProcessManager();

  return (wid: WindowID) => {
    const pid = windows.get(wid)?.pid;
    if (pid !== undefined) {
      updateWindowManager({ action: 'destroy', wid });
      updateProcessManager({ action: 'detach_window', pid, wid });
    }
  };
};
