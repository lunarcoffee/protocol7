import { useStoreWithEqualityFn } from 'zustand/traditional';

import { SystemStore } from '@/stores/system/store';
import { systemStore } from '@/stores/system/SystemStoreProvider';

export const useSystemStoreWithEqualityFn = <T>(
    selector: (system: SystemStore) => T,
    equalityFn: (oldValue: T, newValue: T) => boolean,
): T => {
    if (!systemStore) throw new Error('core: system store uninitialized!');

    return useStoreWithEqualityFn(systemStore, selector, equalityFn);
};
