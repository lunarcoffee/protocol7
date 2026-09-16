import { useSystemStore } from '../system/useSystemStore';

export const useDestroyProcess = () => useSystemStore(({ destroyProcess }) => destroyProcess);
