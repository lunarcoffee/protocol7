import { useWindowManager } from '@/components/contexts/WindowManagerContext';

export const useNextWindowID = () => {
  const [{ windows }] = useWindowManager();

  let id = 0;
  while (windows.get(id)) id++;
  return id;
};
