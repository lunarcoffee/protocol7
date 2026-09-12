import { useShallow } from 'zustand/react/shallow';

import { ProcessID, ProcessInfo } from '@/stores/system/processes/ProcessManager';

import { useSystemStore } from './useSystem';

export const useProcess = (pid: ProcessID): ProcessInfo | undefined =>
    useSystemStore(({ pm }) => pm.processes.get(pid));

export const useProcessIDs = (): ProcessID[] => useSystemStore(useShallow(({ pm }) => Array.from(pm.processes.keys())));

export const useCreateProcess = () => useSystemStore(({ createProcess }) => createProcess);

export const useDestroyProcess = () => useSystemStore(({ destroyProcess }) => destroyProcess);

export const useNextProcessID = () => {
    const pids = useProcessIDs();

    let id = 0;
    while (pids.includes(id)) id++;
    return id;
};
