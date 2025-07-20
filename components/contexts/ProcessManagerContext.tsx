'use client';

import { Draft } from 'immer';
import { PropsWithChildren, createContext, use } from 'react';
import { useImmerReducer } from 'use-immer';
import { WindowID } from './WindowManagerContext';

export type ProcessID = number;

export interface ProcessInfo {
  pid: ProcessID;

  windows: WindowID[]; // a process owns any number of windows
  isHeadless: boolean; // headless processes don't die when their last window is destroyed
  // TODO: implemenet this behavior
}

export interface ProcessManager {
  processes: Map<ProcessID, ProcessInfo>;
}

const DEFAULT_PROCESS_MANAGER = { processes: new Map() };

const ProcessManagerContext = createContext<ProcessManager>(
  DEFAULT_PROCESS_MANAGER,
);

export type ProcessManagerDispatchAction = {
  action: 'create';
  pid: ProcessID;
};

export type ProcessManagerDispatch = (
  action: ProcessManagerDispatchAction,
) => void;

const ProcessManagerDispatchContext = createContext<ProcessManagerDispatch>(
  () => {
    throw new Error('process table uninitialized!');
  },
);

const updateProcessManager = (
  draft: Draft<ProcessManager>,
  action: ProcessManagerDispatchAction,
) => {
  const { processes } = draft;

  switch (action.action) {
    case 'create': {
      const { pid } = action;
      
      processes.set(pid, { pid, windows: [], isHeadless: false }); // TODO: update action object to pass arguments
      break;
    }
  }
};

export const ProcessManagerContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [processManager, dispatch] = useImmerReducer(
    updateProcessManager,
    DEFAULT_PROCESS_MANAGER,
  );

  return (
    <ProcessManagerContext.Provider value={processManager}>
      <ProcessManagerDispatchContext.Provider value={dispatch}>
        {children}
      </ProcessManagerDispatchContext.Provider>
    </ProcessManagerContext.Provider>
  );
};

export const useProcessManager = (): [
  ProcessManager,
  ProcessManagerDispatch,
] => [use(ProcessManagerContext), use(ProcessManagerDispatchContext)];
