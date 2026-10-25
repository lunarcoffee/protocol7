import { useContext } from 'react';
import { useStore } from 'zustand';

import { FileManagerContext } from './FileManagerContext';

import type { FileManagerStore } from '@/stores/fileManager/store';

export const useFileManagerStore = <T,>(selector: (state: FileManagerStore) => T): T => {
    const store = useContext(FileManagerContext);
    if (!store) throw new Error('fileManager: no store context provided!');

    return useStore(store, selector);
};
