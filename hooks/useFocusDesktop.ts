import { useWindowManager } from '@/components/contexts/WindowManagerContext';

export const useFocusDesktop = () => {
  const [, updateWindowManager] = useWindowManager();
  
  return () => updateWindowManager({ action: 'focus_desktop' });
};
