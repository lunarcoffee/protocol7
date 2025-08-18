import { ProcessID } from '@/components/contexts/system/ProcessManager';

import { useProcessManager } from './useProcessManager';

export const useProcessDestroy = () => {
  const [, updateProcessManager] = useProcessManager();

  return (pid: ProcessID) => updateProcessManager({ action: 'destroy', pid });
};
