import { useProcessManager } from '@/components/contexts/ProcessManagerContext';
import {
  useWindowManager,
  WindowCreationInfo,
} from '@/components/contexts/WindowManagerContext';

export const useWindowCreate = () => {
  const [, updateWindowManager] = useWindowManager();
  const [, updateProcessManager] = useProcessManager();

  return (info: WindowCreationInfo) => {
    const { pid, wid } = info;
    updateWindowManager({ action: 'create', wid, info });
    updateProcessManager({ action: 'attach_window', pid, wid });
  };
};
