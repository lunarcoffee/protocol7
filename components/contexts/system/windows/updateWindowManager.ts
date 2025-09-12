import { Draft } from 'immer';

import { Dimensions } from '@/utils/Dimensions';

import {
  processAttachWindow,
  processDetachWindow,
} from '../processes/updateProcessManager';
import { System } from '../SystemContext';
import { WindowCreationInfo, WindowID, WindowManager } from './WindowManager';

/* window manager helpers */

const nextZIndex = ({ windows }: Draft<WindowManager>) =>
  Array.from(windows.values(), ({ zIndex }) => zIndex).reduce(
    (a, b) => Math.max(a, b),
    0,
  ) + 1;

const destroyEphemeralWindows = (system: Draft<System>) =>
  Array.from(system.wm.windows.values())
    .filter((window) => window.isEphemeral && !window.hasFocus)
    .forEach(({ wid }) => windowDestroy(system, wid));

const unfocusAll = (system: Draft<System>) => {
  Array.from(system.wm.windows.values()).forEach(
    (window) => (window.hasFocus = false),
  );
  destroyEphemeralWindows(system);
};

/* window manager actions */

export type WindowManagerDispatchAction =
  | { action: 'create'; info: WindowCreationInfo }
  | { action: 'destroy'; wid: WindowID }
  | { action: 'move'; wid: WindowID; position: Dimensions }
  | {
      action: 'resize';
      wid: WindowID;
      size: Dimensions;
      fixRight: boolean;
      fixBottom: boolean;
    }
  | { action: 'minimize'; wid: WindowID }
  | { action: 'toggle_maximized'; wid: WindowID }
  | { action: 'focus'; wid: WindowID };

export const windowCreate = (
  system: Draft<System>,
  info: WindowCreationInfo,
  // TODO: window creation options (eg yes/no defocus other windows (perhaps for notifications etc))
) => {
  const { wm, pm } = system;
  const { windows } = wm;

  const { wid, pid } = info;

  if (windows.has(wid)) console.warn('recreating existing wid:', wid);

  unfocusAll(system);

  const size = info.size || { x: 300, y: 200 }; // TODO: better default size
  windows.set(wid, {
    title: '',
    position: wm.defaultPosition(size),
    zIndex: nextZIndex(wm),
    size,
    minSize: { x: 120, y: 100 },
    resizable: true,
    isMaximized: false,
    isOpen: true,
    hasFocus: true,
    isEphemeral: false,
    ...info,
  });

  processAttachWindow(pm, pid, wid);
};

// destroy `wid` and perform process-related cleanup
export const windowDestroy = (system: Draft<System>, wid: WindowID) => {
  const {
    wm: { windows },
  } = system;

  const window = windows.get(wid);
  if (window) {
    windows.delete(wid);
    processDetachWindow(system, window.pid, wid);
  }
};

export const windowMove = (
  { windows }: Draft<WindowManager>,
  wid: WindowID,
  position: Dimensions,
) => {
  const window = windows.get(wid);
  if (window) window.position = position;
};

export const windowResize = (
  { windows }: Draft<WindowManager>,
  wid: WindowID,
  { x, y }: Dimensions,
  fixRight: boolean,
  fixBottom: boolean,
) => {
  const window = windows.get(wid);
  if (window) {
    const clampedX = Math.max(x, window.minSize.x);
    const clampedY = Math.max(y, window.minSize.y);

    // since windows are positioned from the top and left, resizing from the top and/or left (i.e.,
    // fixing the bottom and/or right edge(s)) requires that the window be moved
    if (fixRight) window.position.x += window.size.x - clampedX;
    if (fixBottom) window.position.y += window.size.y - clampedY;

    window.size = { x: clampedX, y: clampedY };
  }
};

export const windowMinimize = (system: Draft<System>, wid: WindowID) => {
  const {
    wm: { windows },
  } = system;

  const window = windows.get(wid);
  if (window) {
    window.isOpen = false;
    window.hasFocus = false;
    if (window.isEphemeral) windowDestroy(system, wid);
  }
};

export const windowToggleMaximized = (system: Draft<System>, wid: WindowID) => {
  const {
    wm: { windows },
  } = system;

  const window = windows.get(wid);
  if (window && window.resizable) {
    if (!window.isMaximized) windowFocus(system, wid);
    window.isMaximized = !window.isMaximized;
  }
};

// focuses `wid` and defocuses all other windows
export const windowFocus = (system: Draft<System>, wid: WindowID) => {
  const { wm } = system;

  wm.windows.forEach((window) => {
    window.hasFocus = window.wid === wid;
    if (window.wid === wid) {
      window.zIndex = nextZIndex(wm);
      window.isOpen = true;
    }
  });

  destroyEphemeralWindows(system);
};

export const updateWindowManager = (
  system: Draft<System>,
  action: WindowManagerDispatchAction,
) => {
  const { wm } = system;

  switch (action.action) {
    case 'create': {
      const { info } = action;
      windowCreate(system, info);
      break;
    }
    case 'destroy': {
      const { wid } = action;
      windowDestroy(system, wid);
      break;
    }
    case 'move': {
      const { wid, position } = action;
      windowMove(wm, wid, position);
      break;
    }
    case 'resize': {
      const { wid, size, fixRight, fixBottom } = action;
      windowResize(wm, wid, size, fixRight, fixBottom);
      break;
    }
    case 'minimize': {
      const { wid } = action;
      windowMinimize(system, wid);
      break;
    }
    case 'toggle_maximized': {
      const { wid } = action;
      windowToggleMaximized(system, wid);
      break;
    }
    case 'focus': {
      const { wid } = action;
      windowFocus(system, wid);
      break;
    }
  }
};
