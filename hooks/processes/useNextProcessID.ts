import { useProcessManager } from './useProcessManager';

export const useNextProcessID = () => {
  const [{ processes }] = useProcessManager();

  let id = 0;
  while (processes.get(id)) id++;
  return id;
};
