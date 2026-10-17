import { useShallow } from 'zustand/react/shallow';

import { useSystemStore } from '../system/useSystemStore';
import { ProcessID } from '@/stores/system/processes/ProcessManager';

export const useProcessIDs = (): ProcessID[] => useSystemStore(useShallow(({ pm }) => Array.from(pm.processes.keys())));
