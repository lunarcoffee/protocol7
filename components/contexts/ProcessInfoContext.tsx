'use client';

import { Draft } from 'immer';
import { JSX, PropsWithChildren, createContext, use } from 'react';
import { useImmerReducer } from 'use-immer';

export interface Dimensions {
  x: number;
  y: number;
}

export interface WindowInfo {
  title: string;
  position: Dimensions;
  size: Dimensions;
  isOpen: boolean;
  render: (info: WindowInfo, index: number) => JSX.Element; // TODO: handle multiple windows per process later
}

export type ProcessID = number;

export interface ProcessInfo {
  id: ProcessID;
  windows: WindowInfo[];
}

export type ProcessTable = Map<ProcessID, ProcessInfo>;

// TODO: if need be for internal state (last opened window position)
// interface ProcessManager {
//   processes: ProcessTable;
//
// }

const ProcessTableContext = createContext<ProcessTable>(new Map());

export type WindowAction =
  | { action: 'create'; info: WindowInfo }
  | { action: 'destroy'; index: number }
  | { action: 'move'; index: number; position: Dimensions };

export type ProcessTableDispatchAction =
  | {
      action: 'create';
      pid: ProcessID;
    }
  | {
      action: 'window';
      subaction: WindowAction;
      pid: ProcessID;
    };

export type ProcessTableDispatch = (action: ProcessTableDispatchAction) => void;

const ProcessTableDispatchContext = createContext<ProcessTableDispatch>(() => {
  throw new Error('process table uninitialized!');
});

const updateProcessTable = (
  draft: Draft<ProcessTable>,
  action: ProcessTableDispatchAction,
) => {
  switch (action.action) {
    case 'create': {
      const { pid } = action;
      draft.set(pid, { id: pid, windows: [] });
      break;
    }
    case 'window': {
      const { subaction, pid } = action;

      switch (subaction.action) {
        case 'create':
          const { info } = subaction;
          draft.get(pid)?.windows?.push(info);
          break;
        case 'destroy': {
          const { index } = subaction;
          draft.get(pid)?.windows?.splice(index, 1);
          break;
        }
        case 'move': {
          const { index, position } = subaction;
          if (draft.has(pid))
            draft.get(pid)!.windows[index].position = position;
          break;
        }
      }
      break;
    }
  }
};

export const ProcessTableContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [processTable, dispatch] = useImmerReducer(
    updateProcessTable,
    new Map(),
  );

  return (
    <ProcessTableContext.Provider value={processTable}>
      <ProcessTableDispatchContext.Provider value={dispatch}>
        {children}
      </ProcessTableDispatchContext.Provider>
    </ProcessTableContext.Provider>
  );
};

export const useProcessTable = (): [ProcessTable, ProcessTableDispatch] => [
  use(ProcessTableContext),
  use(ProcessTableDispatchContext),
];
