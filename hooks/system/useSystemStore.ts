import { useStore } from 'zustand';

import { SystemStore } from '@/stores/system/store';
import { systemStore } from '@/stores/system/SystemStoreProvider';

export const useSystemStore = <T>(selector: (system: SystemStore) => T): T => {
    if (!systemStore) throw new Error('core: system store uninitialized!');

    return useStore(systemStore, selector);
};
