import { use } from 'react';

import {
  WindowManager,
  WindowManagerContext,
  WindowManagerDispatch,
  WindowManagerDispatchContext,
} from '@/components/contexts/WindowManagerContext';

export const useWindowManager = (): [WindowManager, WindowManagerDispatch] => [
  use(WindowManagerContext),
  use(WindowManagerDispatchContext),
];
