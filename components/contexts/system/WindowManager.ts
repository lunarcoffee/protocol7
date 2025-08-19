import { JSX } from 'react';

import { ProcessID } from './ProcessManager';

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
    const windowLayer = document.getElementById('window-layer');
    if (!windowLayer) return { x: 200, y: 200 };

    const [{ width, height }] = windowLayer.getClientRects();
    return { x: (width - x) / 2, y: (height - y) / 2 };
  },
};
