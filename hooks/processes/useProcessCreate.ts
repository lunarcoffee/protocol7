import { ProcessID } from '@/components/contexts/ProcessManagerContext';

import { useProcessManager } from './useProcessManager';

export const useProcessCreate = () => {
  const [, updateProcessManager] = useProcessManager();

  return (pid: ProcessID) => updateProcessManager({ action: 'create', pid });
};
