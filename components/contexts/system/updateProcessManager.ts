import { Draft } from 'immer';

import {
  PID_SHELL,
  ProcessCreationInfo,
  ProcessID,
  ProcessManager,
} from './ProcessManager';
import { System } from './SystemContext';
import { windowDestroy } from './updateWindowManager';
import { WindowID } from './WindowManager';

/* process manager helpers */

export const processAttachWindow = (
  { processes }: Draft<ProcessManager>,
  pid: ProcessID,
  wid: WindowID,
) => {
  const process = processes.get(pid);
  if (process) process.windows.push(wid);
};

// detach a window from `pid` and destroy it if no windows remain (unless `pid` is headless)
export const processDetachWindow = (
  system: Draft<System>,
  pid: ProcessID,
  wid: WindowID,
) => {
  const process = system.pm.processes.get(pid);
  if (process) {
    process.windows.splice(process.windows.indexOf(wid));
    if (!process.windows.length && !process.isHeadless)
      processDestroy(system, pid);
  }
};

/* process manager actions */

export type ProcessManagerDispatchAction =
  | { action: 'create'; info: ProcessCreationInfo }
  | { action: 'destroy'; pid: ProcessID };

export const processCreate = (
  { processes }: Draft<ProcessManager>,
  info: ProcessCreationInfo,
) => {
  const { pid } = info;

  if (processes.has(pid)) console.warn('recreating existing pid:', pid);

  processes.set(pid, {
    windows: [],
    isHeadless: false,
    ...info,
  });
};

// destroy `pid` and all of its windows
export const processDestroy = (system: Draft<System>, pid: ProcessID) => {
  const {
    pm: { processes },
  } = system;

  if (pid === PID_SHELL) console.warn('destroying shell process');

  const process = processes.get(pid);
  if (process) {
    processes.delete(pid);
    process.windows.forEach((wid) => windowDestroy(system, wid));
  }
};

export const updateProcessManager = (
  system: Draft<System>,
  action: ProcessManagerDispatchAction,
) => {
  const { pm } = system;

  switch (action.action) {
    case 'create': {
      const { info } = action;
      processCreate(pm, info);
      break;
    }
    case 'destroy': {
      const { pid } = action;
      processDestroy(system, pid);
      break;
    }
  }
};
