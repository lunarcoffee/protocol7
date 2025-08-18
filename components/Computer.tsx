'use client';

import { SystemContextProvider } from './contexts/system/SystemContext';
import { GraphicalShell } from './shell/GraphicalShell';

// TODO: collage wallpaper

export const Computer = () => (
  <div className="flex h-lvh w-lvw items-center justify-center p-10 select-none">
    <SystemContextProvider>
      <GraphicalShell />
    </SystemContextProvider>
  </div>
);
