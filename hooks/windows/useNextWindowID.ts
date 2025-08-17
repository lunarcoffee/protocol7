import { useWindowManager } from './useWindowManager';

export const useNextWindowID = () => {
  const [{ windows }] = useWindowManager();

  let id = 0;
  while (windows.get(id)) id++;
  return id;
};
