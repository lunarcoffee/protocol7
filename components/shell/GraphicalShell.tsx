'use client';

import { enableMapSet } from 'immer';
import { useEffect } from 'react';

import { useProcessCreate, useProcessDestroy } from '@/hooks/processes';

import { PID_SHELL } from '../contexts/system/processes/ProcessManager';
import { WindowLayer } from './WindowLayer';

enableMapSet();

const useShellProcess = () => {
  const createProcess = useProcessCreate();
  const destroyProcess = useProcessDestroy();

  // spawn a persistent shell process
  useEffect(() => {
    createProcess({ pid: PID_SHELL, isHeadless: true });
    return () => destroyProcess(PID_SHELL);
  }, [createProcess, destroyProcess]);
};

export const GraphicalShell = () => {
  useShellProcess();

  return (
    // maintain 16:10 (8:5) aspect ratio but take up at most 90% of the entire viewport
    <div
      className={`
        absolute top-0 right-0 bottom-0 left-0 m-auto h-[calc(5/8*90lvw)]
        max-h-9/10 w-9/10 max-w-[calc(8/5*90lvh)] overflow-clip
      `}
    >
      <WindowLayer />
    </div>
  );
};
