'use client';

import { ProcessManagerContextProvider } from '../contexts/ProcessManagerContext';
import { WindowManagerContextProvider } from '../contexts/WindowManagerContext';
import { Taskbar } from './taskbar/Taskbar';
import { WindowLayer } from './WindowLayer';
import { Desktop } from './Desktop';
import { enableMapSet } from 'immer';

enableMapSet();

export const GraphicalShell = () => {
  return (
    <div className="relative aspect-[16/10] max-w-[144lvh] min-w-0 max-h-[90lvh] min-h-0 overflow-clip">
      <ProcessManagerContextProvider>
        <WindowManagerContextProvider>
          <Desktop />
          <WindowLayer />
          <Taskbar />
        </WindowManagerContextProvider>
      </ProcessManagerContextProvider>
    </div>
  );
};
