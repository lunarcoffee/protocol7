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
  render: (info: WindowInfo) => JSX.Element; // TODO: handle multiple windows per process later
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

export type ProcessTableDispatchAction = {
  action: 'create';
  render: (info: WindowInfo) => JSX.Element; // TODO: this is not fitting
};

export type ProcessTableDispatch = (action: ProcessTableDispatchAction) => void;

const ProcessTableDispatchContext = createContext<ProcessTableDispatch>(() => {
  throw new Error('process table uninitialized!');
});

const updateProcessTable = (
  draft: Draft<ProcessTable>,
  { action, ...args }: ProcessTableDispatchAction,
) => {
  switch (action) {
    case 'create':
      let id = 0;
      while (draft.get(id)) id++;

      const process = {
        id,
        windows: [
          {
            title: 'Random title lol',
            position: { x: 300, y: 200 }, // TODO: ew
            size: { x: 500, y: 300 },
            render: args.render,
            isOpen: true,
          },
        ],
      };

      draft.set(id, process);
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
