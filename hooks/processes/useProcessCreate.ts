import { ProcessCreationInfo } from '@/components/contexts/system/ProcessManager';

import { useProcessManager } from './useProcessManager';

export const useProcessCreate = () => {
  const [, updateProcessManager] = useProcessManager();

  return (info: ProcessCreationInfo) =>
    updateProcessManager({ action: 'create', info });
};
