import { ProcessID } from '@/components/contexts/system/ProcessManager';

import { useWindowManager } from '../windows/useWindowManager';
import { useProcessManager } from './useProcessManager';

export const useProcessDestroy = () => {
  const [, updateProcessManager] = useProcessManager();
  const [{ windows }, updateWindowManager] = useWindowManager();

  return (pid: ProcessID) => {
    updateProcessManager({ action: 'destroy', pid });
    windows.forEach(({ wid, pid: windowPid }) => {
      if (pid === windowPid) updateWindowManager({ action: 'destroy', wid });
    });
  };
};
