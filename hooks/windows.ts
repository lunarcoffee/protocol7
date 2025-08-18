import { WindowManagerDispatchAction } from '@/components/contexts/system/updateWindowManager';
import {
  Dimensions,
  WindowCreationInfo,
  WindowID,
  WindowManager,
} from '@/components/contexts/system/WindowManager';

import { useSystem } from './useSystem';

export type WindowManagerDispatch = (
  action: WindowManagerDispatchAction,
) => void;

export const useWindowManager = (): [WindowManager, WindowManagerDispatch] => {
  const [{ wm }, dispatch] = useSystem();
  return [
    wm,
    (action: WindowManagerDispatchAction) =>
      dispatch({ type: 'window', action }),
  ];
};

export const useNextWindowID = () => {
  const [{ windows }] = useWindowManager();

  let id = 0;
  while (windows.get(id)) id++;
  return id;
};

export const useWindowCreate = () => {
  const [, updateWindowManager] = useWindowManager();

  return (info: WindowCreationInfo) =>
    updateWindowManager({ action: 'create', info });
};

export const useWindowDestroy = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'destroy', wid });
};

export const useWindowMove = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID, position: Dimensions) =>
    updateWindowManager({ action: 'move', wid, position });
};

export const useWindowResize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID, size: Dimensions, shiftX: boolean, shiftY: boolean) =>
    updateWindowManager({ action: 'resize', wid, size, shiftX, shiftY });
};

export const useWindowMinimize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'minimize', wid });
};

export const useWindowMaximize = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) =>
    updateWindowManager({ action: 'toggle_maximized', wid });
};

export const useWindowFocus = () => {
  const [, updateWindowManager] = useWindowManager();

  return (wid: WindowID) => updateWindowManager({ action: 'focus', wid });
};

export const useFocusDesktop = () => {
  const [, updateWindowManager] = useWindowManager();

  return () => updateWindowManager({ action: 'unfocus_all' });
};
