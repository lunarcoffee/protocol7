import { useSystemStore } from '../system/useSystemStore';

export const useDestroyWindow = () => useSystemStore(({ destroyWindow }) => destroyWindow);
