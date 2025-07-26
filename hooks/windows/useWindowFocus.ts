import {
  useWindowManager,
  WindowID,
} from '@/components/contexts/WindowManagerContext';

export const useWindowFocus = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'focus', wid });
};
