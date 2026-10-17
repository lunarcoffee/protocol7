import { useSystemStore } from '../system/useSystemStore';

import type { ProcessID, ProcessInfo } from '@/stores/system/processes/ProcessManager';

export const useProcess = (pid: ProcessID): ProcessInfo | undefined =>
    useSystemStore(({ pm }) => pm.processes.get(pid));
