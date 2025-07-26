import { createContext, JSX, PropsWithChildren, use } from 'react';
import { ProcessID } from './ProcessManagerContext';
import { Draft } from 'immer';
import { useImmerReducer } from 'use-immer';

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
  defaultPosition: Dimensions;
}

const DEAFULT_WINDOW_MANAGER = {
  windows: new Map(),
  defaultPosition: { x: 200, y: 200 },
};

const WindowManagerContext = createContext<WindowManager>(
  DEAFULT_WINDOW_MANAGER,
);

export type WindowManagerDispatchAction =
  | { action: 'create'; wid: WindowID; info: WindowCreationInfo }
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

const WindowManagerDispatchContext = createContext<WindowManagerDispatch>(
  () => {
    throw new Error('window manager uninitialized!');
  },
);

const nextZIndex = ({ windows }: Draft<WindowManager>) =>
  Array.from(windows.values()).reduce(
    (max, window) => Math.max(max, window.zIndex),
    0,
  ) + 1;

const focusWindow = (draft: Draft<WindowManager>, wid: WindowID) => {
  const { windows } = draft;
  windows.forEach((window) => {
    window.hasFocus = window.wid === wid;
    if (window.wid === wid) {
      window.zIndex = nextZIndex(draft);
      window.isOpen = true;
    }
  });
};

const unfocusAll = ({ windows }: Draft<WindowManager>) =>
  windows.forEach((window) => (window.hasFocus = false));

const updateWindowManager = (
  draft: Draft<WindowManager>,
  action: WindowManagerDispatchAction,
) => {
  const { windows } = draft;

  // TODO: check for duplicate wid
  switch (action.action) {
    case 'create':
      const { wid, info: creationInfo } = action;

      const info = {
        title: '',
        position: draft.defaultPosition, // TODO: default position shifting like windows? or maybe sentinel options like 'center' or smth
        zIndex: nextZIndex(draft),
        minSize: { x: 120, y: 80 },
        resizable: true,
        isMaximized: false,
        isOpen: true,
        isTransitioning: true,
        hasFocus: true,
        ...creationInfo,
      };

      unfocusAll(draft); // the new window should be the only focused one
      windows.set(wid, info);
      break;
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
      break;
    }
    case 'toggle_maximized': {
      const { wid } = action;

      const window = windows.get(wid);
      if (window && window.resizable) {
        if (!window.isMaximized) focusWindow(draft, wid);
        window.isMaximized = !window.isMaximized;
      }
      break;
    }
    case 'focus': {
      const { wid } = action;

      focusWindow(draft, wid);
      break;
    }
    case 'unfocus_all': {
      unfocusAll(draft);
      break;
    }
  }
};

export const WindowManagerContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [windowManager, dispatch] = useImmerReducer(
    updateWindowManager,
    DEAFULT_WINDOW_MANAGER,
  );

  return (
    <WindowManagerContext.Provider value={windowManager}>
      <WindowManagerDispatchContext.Provider value={dispatch}>
        {children}
      </WindowManagerDispatchContext.Provider>
    </WindowManagerContext.Provider>
  );
};

export const useWindowManager = (): [WindowManager, WindowManagerDispatch] => [
  use(WindowManagerContext),
  use(WindowManagerDispatchContext),
];
