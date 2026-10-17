import { useStore } from 'zustand';

import { systemStore } from './useInitializeSystem';

import type { SystemStore } from '@/stores/system/store';

export const useSystemStore = <T>(selector: (system: SystemStore) => T): T => {
    if (!systemStore) throw new Error('core: system store uninitialized!');

    return useStore(systemStore, selector);
};
