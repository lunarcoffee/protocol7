'use client';

import { SystemContextProvider } from './contexts/system/SystemContext';
import { GraphicalShell } from './shell/GraphicalShell';

const LoadingFallback = () => (
  <div
    className={`
      flex h-full w-full items-center justify-center inset-shadow-[0_0_10rem]
      inset-shadow-white/15
    `}
  >
    <p className="font-manrope text-lg text-white/80">
      Establishing connection to remote shell...
    </p>
  </div>
);

export const Computer = () => (
  <div
    className={`
      flex h-lvh w-lvw items-center justify-center p-10 font-open-sans
      select-none
    `}
  >
    <SystemContextProvider fallback={<LoadingFallback />}>
      <GraphicalShell />
    </SystemContextProvider>
  </div>
);
