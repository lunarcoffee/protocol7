import { useShallow } from 'zustand/react/shallow';

import { ProcessID } from '@/stores/system/processes/ProcessManager';

import { useSystemStore } from '../system/useSystemStore';

export const useProcessIDs = (): ProcessID[] => useSystemStore(useShallow(({ pm }) => Array.from(pm.processes.keys())));
