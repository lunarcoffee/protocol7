import { useProcessManager } from '@/components/contexts/ProcessManagerContext';

export const useNextProcessId = () => {
  const [processTable] = useProcessManager();

  let id = 0;
  while (processTable.get(id)) id++;
  return id;
};
