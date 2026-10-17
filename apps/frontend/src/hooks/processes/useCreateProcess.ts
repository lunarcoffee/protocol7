import { useSystemStore } from '../system/useSystemStore';

export const useCreateProcess = () => useSystemStore(({ createProcess }) => createProcess);
