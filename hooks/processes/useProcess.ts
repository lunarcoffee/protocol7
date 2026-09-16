import { ProcessID, ProcessInfo } from '@/stores/system/processes/ProcessManager';

import { useSystemStore } from '../system/useSystemStore';

export const useProcess = (pid: ProcessID): ProcessInfo | undefined =>
    useSystemStore(({ pm }) => pm.processes.get(pid));
