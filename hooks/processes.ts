import {
  ProcessCreationInfo,
  ProcessID,
  ProcessManager,
} from '@/components/contexts/system/ProcessManager';
import { ProcessManagerDispatchAction } from '@/components/contexts/system/updateProcessManager';

import { useSystem } from './useSystem';

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

export const useNextProcessID = () => {
  const [{ processes }] = useProcessManager();

  let id = 0;
  while (processes.get(id)) id++;
  return id;
};

export const useProcessCreate = () => {
  const [, updateProcessManager] = useProcessManager();

  return (info: ProcessCreationInfo) =>
    updateProcessManager({ action: 'create', info });
};

export const useProcessDestroy = () => {
  const [, updateProcessManager] = useProcessManager();

  return (pid: ProcessID) => updateProcessManager({ action: 'destroy', pid });
};
