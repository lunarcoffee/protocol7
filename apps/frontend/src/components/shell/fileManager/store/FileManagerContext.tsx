import { type PropsWithChildren, createContext, useState } from 'react';

import { createFileManagerStore } from '@/stores/fileManager/store';

import type { FileManagerStoreAPI } from '@/stores/fileManager/store';
import type { PropsWithProcessInfo } from '@/stores/system/processes/ProcessManager';

export const FileManagerContext = createContext<FileManagerStoreAPI | null>(null);

export type FileManagerContextProviderProps = PropsWithChildren & PropsWithProcessInfo;

export const FileManagerContextProvider = ({ children, pinfo }: FileManagerContextProviderProps) => {
    const [store] = useState(() => createFileManagerStore(pinfo));

    return <FileManagerContext value={store}>{children}</FileManagerContext>;
};
