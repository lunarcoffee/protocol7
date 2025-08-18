import { ProcessManager } from '@/components/contexts/system/ProcessManager';
import { ProcessManagerDispatchAction } from '@/components/contexts/system/updateProcessManager';

import { useSystem } from '../useSystem';

export type ProcessManagerDispatch = (
  action: ProcessManagerDispatchAction,
) => void;

export const useProcessManager = (): [
  ProcessManager,
  ProcessManagerDispatch,
] => {
  const [{ pm }, dispatch] = useSystem();
  return [
    pm,
    (action: ProcessManagerDispatchAction) =>
      dispatch({ type: 'process', action }),
  ];
};
