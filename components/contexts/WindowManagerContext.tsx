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
  size: Dimensions;
  isOpen: boolean;
  render: (info: WindowInfo, index: number) => JSX.Element; // TODO: handle multiple windows per process later
}

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
  | { action: 'create'; wid: WindowID; info: WindowInfo }
  | { action: 'destroy'; wid: WindowID }
  | { action: 'move'; wid: WindowID; position: Dimensions };

export type WindowManagerDispatch = (
  action: WindowManagerDispatchAction,
) => void;

const WindowManagerDispatchContext = createContext<WindowManagerDispatch>(
  () => {
    throw new Error('window manager uninitialized!');
  },
);

const updateWindowManager = (
  draft: Draft<WindowManager>,
  action: WindowManagerDispatchAction,
) => {
  const { windows } = draft;

  switch (action.action) {
    case 'create':
      const { wid, info } = action;

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
