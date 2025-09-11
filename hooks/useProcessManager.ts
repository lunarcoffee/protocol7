import {
  ProcessCreationInfo,
  ProcessID,
  ProcessManager,
} from '@/components/contexts/system/processes/ProcessManager';
import { ProcessManagerDispatchAction } from '@/components/contexts/system/processes/updateProcessManager';

import { useSystem } from './useSystem';

export const useProcessManager = () => {
  const [pm, dispatch] = useProcessManagerRaw();

  return {
    nextProcessID: nextProcessID(pm),
    ...pm,

    create: actionCreate(dispatch),
    destroy: actionDestroy(dispatch),
  };
};

type ProcessManagerDispatch = (action: ProcessManagerDispatchAction) => void;

const useProcessManagerRaw = (): [ProcessManager, ProcessManagerDispatch] => {
  const [{ pm }, dispatch] = useSystem();
  return [
    pm,
    (action: ProcessManagerDispatchAction) =>
      dispatch({ type: 'process', action }),
  ];
};

const nextProcessID = ({ processes }: ProcessManager) => {
  let id = 0;
  while (processes.get(id)) id++;
  return id;
};

const actionCreate =
  (dispatch: ProcessManagerDispatch) => (info: ProcessCreationInfo) =>
    dispatch({ action: 'create', info });

const actionDestroy = (dispatch: ProcessManagerDispatch) => (pid: ProcessID) =>
  dispatch({ action: 'destroy', pid });
