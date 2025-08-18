import {
  ProcessManager,
  ProcessManagerDispatch,
  ProcessManagerDispatchAction,
} from '@/components/contexts/system/ProcessManager';

import { useSystem } from '../useSystem';

export const useProcessManager = (): [
  ProcessManager,
  ProcessManagerDispatch,
] => {
  const [{ pm }, dispatch] = useSystem();
  return [
    pm,
    (action: ProcessManagerDispatchAction) => {
      dispatch({ type: 'process', action });
    },
  ];
};
