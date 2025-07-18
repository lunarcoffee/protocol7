'use client';

import {
  PropsWithChildren,
  useContext,
  createContext,
  useReducer,
} from 'react';

export interface ProcessInfo {
  id: number;
  title: string;
}

const ProcessInfoContext = createContext<ProcessInfo[]>([]);

export type ProcessInfoDispatchAction =
  | { action: 'create' }
  | { action: 'kill' };

export type ProcessInfoDispatch = (action: ProcessInfoDispatchAction) => void;

const ProcessInfoDispatchContext = createContext<ProcessInfoDispatch>(() => {});

const updateProcessInfo = (
  state: ProcessInfo[],
  { action }: ProcessInfoDispatchAction,
) => {
  return state;
};

export const ProcessInfoContextProvider = ({ children }: PropsWithChildren) => {
  const [processInfo, dispatch] = useReducer(updateProcessInfo, []);

  return (
    <ProcessInfoContext.Provider value={processInfo}>
      <ProcessInfoDispatchContext.Provider value={dispatch}>
        {children}
      </ProcessInfoDispatchContext.Provider>
    </ProcessInfoContext.Provider>
  );
};

export const useProcessInfo = (): [ProcessInfo[], ProcessInfoDispatch] => [
  useContext(ProcessInfoContext),
  useContext(ProcessInfoDispatchContext),
];
