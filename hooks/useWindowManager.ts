import { WindowManagerDispatchAction } from '@/components/contexts/system/windows/updateWindowManager';
import {
  MIN_USER_WID,
  WindowCreationInfo,
  WindowID,
  WindowManager,
} from '@/components/contexts/system/windows/WindowManager';
import { Dimensions } from '@/utils/Dimensions';

import { useSystem } from './useSystem';

export const useWindowManager = () => {
  const [wm, dispatch] = useWindowManagerRaw();

  return {
    nextWindowID: nextWindowID(wm),
    ...wm,

    create: actionCreate(dispatch),
    destroy: actionDestroy(dispatch),
    move: actionMove(dispatch),
    resize: actionResize(dispatch),
    minimize: actionMinimize(dispatch),
    maximize: actionMaximize(dispatch),
    focus: actionFocus(dispatch),
  };
};

type WindowManagerDispatch = (action: WindowManagerDispatchAction) => void;

const useWindowManagerRaw = (): [WindowManager, WindowManagerDispatch] => {
  const [{ wm }, dispatch] = useSystem();
  return [
    wm,
    (action: WindowManagerDispatchAction) =>
      dispatch({ type: 'window', action }),
  ];
};

const nextWindowID = ({ windows }: WindowManager) => {
  let id = MIN_USER_WID;
  while (windows.get(id)) id++;
  return id;
};

const actionCreate =
  (dispatch: WindowManagerDispatch) => (info: WindowCreationInfo) =>
    dispatch({ action: 'create', info });

const actionDestroy = (dispatch: WindowManagerDispatch) => (wid: WindowID) =>
  dispatch({ action: 'destroy', wid });

const actionMove =
  (dispatch: WindowManagerDispatch) => (wid: WindowID, position: Dimensions) =>
    dispatch({ action: 'move', wid, position });

const actionResize =
  (dispatch: WindowManagerDispatch) =>
  (wid: WindowID, size: Dimensions, shiftX: boolean, shiftY: boolean) =>
    dispatch({ action: 'resize', wid, size, shiftX, shiftY });

const actionMinimize = (dispatch: WindowManagerDispatch) => (wid: WindowID) =>
  dispatch({ action: 'minimize', wid });

const actionMaximize = (dispatch: WindowManagerDispatch) => (wid: WindowID) =>
  dispatch({ action: 'toggle_maximized', wid });

const actionFocus = (dispatch: WindowManagerDispatch) => (wid: WindowID) =>
  dispatch({ action: 'focus', wid });
