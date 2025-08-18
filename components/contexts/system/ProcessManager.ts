'use client';

import { Draft } from 'immer';

import { System } from './SystemContext';
import { WindowID } from './WindowManager';

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

export type ProcessManagerDispatchAction =
  | { action: 'create'; info: ProcessCreationInfo }
  | { action: 'destroy'; pid: ProcessID }
  | { action: 'attach_window'; pid: ProcessID; wid: WindowID }
  | { action: 'detach_window'; pid: ProcessID; wid: WindowID };

export type ProcessManagerDispatch = (
  action: ProcessManagerDispatchAction,
) => void;

const destroyProcess = (
  { processes }: Draft<ProcessManager>,
  pid: ProcessID,
) => {
  if (pid === PID_SHELL) console.warn('destroying shell process');
  processes.delete(pid);
};

export const detachWindow = (
  { pm }: Draft<System>,
  pid: ProcessID,
  wid: WindowID,
) => {
  const process = pm.processes.get(pid);
  if (process) {
    process.windows.splice(process.windows.indexOf(wid));
    if (!process.windows.length && !process.isHeadless) destroyProcess(pm, pid);
  }
};

export const updateProcessManager = (
  system: Draft<System>,
  action: ProcessManagerDispatchAction,
) => {
  const { wm, pm } = system;
  const { processes } = pm;

  switch (action.action) {
    case 'create': {
      const { info } = action;
      const { pid } = info;

      if (processes.has(pid)) console.warn('recreating existing pid:', pid);

      processes.set(pid, { windows: [], isHeadless: false, ...info });
      break;
    }
    case 'destroy': {
      const { pid } = action;

      destroyProcess(pm, pid);
      break;
    }
    case 'attach_window': {
      const { pid, wid } = action;

      const process = processes.get(pid);
      if (process) process.windows.push(wid);
      break;
    }
    case 'detach_window': {
      const { pid, wid } = action;
      detachWindow(system, pid, wid);
      break;
    }
  }
};
