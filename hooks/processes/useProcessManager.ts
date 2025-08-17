import { use } from 'react';

import {
  ProcessManager,
  ProcessManagerContext,
  ProcessManagerDispatch,
  ProcessManagerDispatchContext,
} from '@/components/contexts/ProcessManagerContext';

export const useProcessManager = (): [
  ProcessManager,
  ProcessManagerDispatch,
] => [use(ProcessManagerContext), use(ProcessManagerDispatchContext)];
