'use client';

import { SystemContextProvider } from './contexts/system/SystemContext';
import { GraphicalShell } from './shell/GraphicalShell';

const LoadingFallback = () => (
  <p className="text-lg">Establishing connection to remote shell...</p>
);

export const Computer = () => (
  <div className="flex h-lvh w-lvw items-center justify-center p-10 select-none">
    <SystemContextProvider fallback={<LoadingFallback />}>
      <GraphicalShell />
    </SystemContextProvider>
  </div>
);
