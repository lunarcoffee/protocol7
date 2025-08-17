import { useWindowManager } from './useWindowManager';

export const useFocusDesktop = () => {
  const [, updateWindowManager] = useWindowManager();

  return () => updateWindowManager({ action: 'unfocus_all' });
};
