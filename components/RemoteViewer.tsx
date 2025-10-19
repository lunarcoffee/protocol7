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

export const RemoteViewer = () => (
  <div
    className={`
      flex h-lvh w-lvw items-center justify-center p-10 font-open-sans
      select-none
    `}
  >
    {/* maintain 16:10 (8:5) aspect ratio but take up at most 90% of the entire viewport */}
    <div
      className={`
        absolute top-0 right-0 bottom-0 left-0 m-auto h-[calc(5/8*90lvw)]
        max-h-9/10 w-9/10 max-w-[calc(8/5*90lvh)] overflow-clip
      `}
    >
      <SystemContextProvider fallback={<LoadingFallback />}>
        <GraphicalShell />
      </SystemContextProvider>
    </div>
  </div>
);
