import { WindowCreationInfo } from '@/components/contexts/system/WindowManager';

import { useProcessManager } from '../processes/useProcessManager';
import { useWindowManager } from './useWindowManager';

export const useWindowCreate = () => {
  const [, updateWindowManager] = useWindowManager();
  const [, updateProcessManager] = useProcessManager();

  return (info: WindowCreationInfo) => {
    const { pid, wid } = info;
    updateWindowManager({ action: 'create', info });
    updateProcessManager({ action: 'attach_window', pid, wid });
  };
};
