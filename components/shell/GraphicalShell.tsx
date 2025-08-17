'use client';

import { enableMapSet } from 'immer';

import { ProcessManagerContextProvider } from '../contexts/ProcessManagerContext';
import { WindowManagerContextProvider } from '../contexts/WindowManagerContext';
import { WindowLayer } from './WindowLayer';

enableMapSet();

export const GraphicalShell = () => {
  return (
    // maintain 16:10 (8:5) aspect ratio but take up at most 90% of the entire viewport
    <div className="absolute top-0 right-0 left-0 bottom-0 w-9/10 h-[calc(5/8*90lvw)] max-w-[calc(8/5*90lvh)] max-h-9/10 m-auto overflow-clip">
      <ProcessManagerContextProvider>
        <WindowManagerContextProvider>
          <WindowLayer />
        </WindowManagerContextProvider>
      </ProcessManagerContextProvider>
    </div>
  );
};
