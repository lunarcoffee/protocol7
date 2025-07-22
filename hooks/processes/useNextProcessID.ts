import { useProcessManager } from '@/components/contexts/ProcessManagerContext';

export const useNextProcessID = () => {
  const [{ processes }] = useProcessManager();

  let id = 0;
  while (processes.get(id)) id++;
  return id;
};
