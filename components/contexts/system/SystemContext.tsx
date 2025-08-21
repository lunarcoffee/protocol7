import { configureSingle } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Draft } from 'immer';
import { createContext, PropsWithChildren, useEffect } from 'react';
import { useImmerReducer } from 'use-immer';

import {
  DEFAULT_PROCESS_MANAGER,
  deinitializeProcessManager,
  initializeProcessManager,
  ProcessManager,
} from './processes/ProcessManager';
import {
  ProcessManagerDispatchAction,
  updateProcessManager,
} from './processes/updateProcessManager';
import {
  updateWindowManager,
  WindowManagerDispatchAction,
} from './windows/updateWindowManager';
import { DEFAULT_WINDOW_MANAGER, WindowManager } from './windows/WindowManager';

export interface System {
  pm: ProcessManager;
  wm: WindowManager;
}

const DEFAULT_SYSTEM = {
  pm: DEFAULT_PROCESS_MANAGER,
  wm: DEFAULT_WINDOW_MANAGER,
};

export type SystemDispatchAction =
  | { type: 'process'; action: ProcessManagerDispatchAction }
  | { type: 'window'; action: WindowManagerDispatchAction };

export type SystemDispatch = (action: SystemDispatchAction) => void;

const updateSystem = (
  system: Draft<System>,
  { type, action }: SystemDispatchAction,
) => {
  switch (type) {
    case 'process':
      updateProcessManager(system, action);
      break;
    case 'window':
      updateWindowManager(system, action);
      break;
  }
};

export const SystemContext = createContext(DEFAULT_SYSTEM);

export const SystemDispatchContext = createContext<SystemDispatch>(() => {
  throw new Error('system context uninitialized!');
});

export const SystemContextProvider = ({ children }: PropsWithChildren) => {
  const [system, dispatch] = useImmerReducer(updateSystem, DEFAULT_SYSTEM);

  useEffect(() => {
    initializeProcessManager(dispatch);
    configureSingle({ backend: IndexedDB });

    return () => deinitializeProcessManager(dispatch);
    // `dispatch` should be referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SystemContext.Provider value={system}>
      <SystemDispatchContext.Provider value={dispatch}>
        {children}
      </SystemDispatchContext.Provider>
    </SystemContext.Provider>
  );
};
