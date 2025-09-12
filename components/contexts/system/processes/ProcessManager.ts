'use client';

import { WindowID } from '../windows/WindowManager';

export type ProcessID = number;

export const PID_SHELL = 0;

export interface ProcessInfo {
  pid: ProcessID;

  windows: WindowID[]; // a process owns any number of windows
  isHeadless: boolean; // headless processes don't die when their last window is destroyed
  // TODO: implemenet this behavior
}

type RequiredProcessProps = 'pid';

export type ProcessCreationInfo = Pick<ProcessInfo, RequiredProcessProps> &
  Partial<Omit<ProcessInfo, RequiredProcessProps>>;

export interface ProcessManager {
  processes: Map<ProcessID, ProcessInfo>;
}

export const DEFAULT_PROCESS_MANAGER = { processes: new Map() };
