import { PropsWithChildren } from 'react';

import { ProcessManagerContextProvider } from './ProcessManagerContext';
import { WindowManagerContextProvider } from './WindowManagerContext';

export const SystemContextProviders = ({ children }: PropsWithChildren) => (
  <ProcessManagerContextProvider>
    <WindowManagerContextProvider>{children}</WindowManagerContextProvider>
  </ProcessManagerContextProvider>
);
