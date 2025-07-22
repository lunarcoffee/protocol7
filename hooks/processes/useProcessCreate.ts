import {
  ProcessID,
  useProcessManager,
} from '@/components/contexts/ProcessManagerContext';

export const useProcessCreate = () => {
  const [, updateProcessManager] = useProcessManager();

  return (pid: ProcessID) => updateProcessManager({ action: 'create', pid });
};
