import { Draft } from 'immer';
import { JSX } from 'react';

import { detachWindow, ProcessID } from './ProcessManager';
import { System } from './SystemContext';

export type WindowID = number;

export interface Dimensions {
  x: number;
  y: number;
}

export interface WindowInfo {
  wid: WindowID;
  pid: ProcessID; // every window is owned by a process

  title: string;

  position: Dimensions;
  zIndex: number;

  size: Dimensions;
  minSize: Dimensions;
  resizable: boolean;
  isMaximized: boolean;

  isOpen: boolean;
  hasFocus: boolean;
  isEphemeral: boolean; // ephemeral windows close upon losing focus

  render: (info: WindowInfo) => JSX.Element;
}

export interface PropsWithWindowInfo {
  windowInfo: WindowInfo;
}

type RequiredWindowProps = 'wid' | 'pid' | 'size' | 'render';

export type WindowCreationInfo = Pick<WindowInfo, RequiredWindowProps> &
  Partial<Omit<WindowInfo, RequiredWindowProps>>;

export interface WindowManager {
  windows: Map<WindowID, WindowInfo>;
  defaultPosition: (size: Dimensions) => Dimensions;
}

export const DEFAULT_WINDOW_MANAGER: WindowManager = {
  windows: new Map(),

  // center newly created windows by default
  defaultPosition: ({ x, y }) => {
    const [{ width, height }] = document
      .getElementById('window-layer')!
      .getClientRects();

    return { x: (width - x) / 2, y: (height - y) / 2 };
  },
};

export type WindowManagerDispatchAction =
  | { action: 'create'; info: WindowCreationInfo }
  | { action: 'destroy'; wid: WindowID }
  | { action: 'move'; wid: WindowID; position: Dimensions }
  | {
      action: 'resize';
      wid: WindowID;
      size: Dimensions;
      shiftX: boolean;
      shiftY: boolean;
    }
  | { action: 'minimize'; wid: WindowID }
  | { action: 'toggle_maximized'; wid: WindowID }
  | { action: 'focus'; wid: WindowID }
  | { action: 'unfocus_all' };

export type WindowManagerDispatch = (
  action: WindowManagerDispatchAction,
) => void;

const nextZIndex = ({ windows }: Draft<WindowManager>) =>
  Array.from(windows.values()).reduce(
    (max, window) => Math.max(max, window.zIndex),
    0,
  ) + 1;

const destroyEphemeralWindows = (system: Draft<System>) => {
  const {
    wm: { windows },
  } = system;

  Array.from(windows.values())
    .filter((window) => window.isEphemeral && !window.hasFocus)
    .forEach(({ wid, pid }) => {
      windows.delete(wid);
      detachWindow(system, pid, wid);
    });
};

const focusWindow = (system: Draft<System>, wid: WindowID) => {
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

const unfocusAll = (system: Draft<System>) => {
  const {
    wm: { windows },
  } = system;

  windows.forEach((window) => (window.hasFocus = false));

  destroyEphemeralWindows(system);
};

export const updateWindowManager = (
  system: Draft<System>,
  action: WindowManagerDispatchAction,
) => {
  const { wm, pm } = system;
  const { windows } = wm;

  switch (action.action) {
    case 'create': {
      const { info: creationInfo } = action;
      const { wid } = creationInfo;

      if (windows.has(wid)) console.warn('recreating existing wid:', wid);

      unfocusAll(system); // the new window should be the only focused one

      windows.set(wid, {
        title: '',
        position: wm.defaultPosition(creationInfo.size),
        zIndex: nextZIndex(wm),
        minSize: { x: 120, y: 100 },
        resizable: true,
        isMaximized: false,
        isOpen: true,
        hasFocus: true,
        isEphemeral: false,
        ...creationInfo,
      });
      break;
    }
    case 'destroy': {
      const { wid } = action;

      windows.delete(wid);
      break;
    }
    case 'move': {
      const { wid, position } = action;

      const window = windows.get(wid);
      if (window) window.position = position;
      break;
    }
    case 'resize': {
      const {
        wid,
        size: { x, y },
        shiftX,
        shiftY,
      } = action;

      const window = windows.get(wid);
      if (window) {
        const clampedX = Math.max(x, window.minSize.x);
        const clampedY = Math.max(y, window.minSize.y);

        // this is kinda hacky because it's built around the needs of the resize handles - resizing
        // from the top and/or left requires that the window be moved
        if (shiftX) window.position.x += window.size.x - clampedX;
        if (shiftY) window.position.y += window.size.y - clampedY;

        window.size = { x: clampedX, y: clampedY };
      }
      break;
    }
    case 'minimize': {
      const { wid } = action;

      const window = windows.get(wid);
      if (window) {
        window.isOpen = false;
        window.hasFocus = false;
      }

      destroyEphemeralWindows(system);
      break;
    }
    case 'toggle_maximized': {
      const { wid } = action;

      const window = windows.get(wid);
      if (window && window.resizable) {
        if (!window.isMaximized) focusWindow(system, wid);
        window.isMaximized = !window.isMaximized;
      }
      break;
    }
    case 'focus': {
      const { wid } = action;

      focusWindow(system, wid);
      break;
    }
    case 'unfocus_all': {
      unfocusAll(system);
      break;
    }
  }
};
