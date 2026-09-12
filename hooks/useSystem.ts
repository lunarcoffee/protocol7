import { useContext } from 'react';
import { useStore } from 'zustand';

import { SystemStoreContext } from '@/components/contexts/SystemContext';
import { SystemStore } from '@/stores/system/store';

export const useSystemStore = <T>(selector: (system: SystemStore) => T): T => {
    const store = useContext(SystemStoreContext);
    if (!store) throw new Error('system store uninitialized!');

    return useStore(store, selector);
};

export const useSystemHostname = () => useSystemStore((system) => system.hostname);
