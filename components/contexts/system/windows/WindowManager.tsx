import { JSX } from 'react';

import { Dimensions } from '@/utils/Dimensions';

import { ProcessID } from '../processes/ProcessManager';

export type WindowID = number;

// app-specific system-reserved window IDs
export const WID_DESKTOP = 0;
export const WID_TASKBAR = 1;
export const WID_LAUNCHER = 2;

// user window IDs start at this ID, any below are reserved
export const MIN_USER_WID = 100;

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

type RequiredWindowProps = 'wid' | 'pid' | 'render';

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
