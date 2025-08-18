import { WindowCreationInfo } from '@/components/contexts/system/WindowManager';

import { useWindowManager } from './useWindowManager';

export const useWindowCreate = () => {
  const [, updateWindowManager] = useWindowManager();

  return (info: WindowCreationInfo) =>
    updateWindowManager({ action: 'create', info });
};
