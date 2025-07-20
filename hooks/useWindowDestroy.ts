import {
  ProcessID,
  useProcessManager,
} from '@/components/contexts/ProcessManagerContext';
import {
  useWindowManager,
  WindowID,
} from '@/components/contexts/WindowManagerContext';

export const useWindowDestroy = () => {
  const [, updateWindowManager] = useWindowManager();
  const [, updateProcessManager] = useProcessManager();

  return (pid: ProcessID, wid: WindowID) => {
    updateWindowManager({ action: 'destroy', wid });
    updateProcessManager({ action: 'detach_window', pid, wid });
  };
};
