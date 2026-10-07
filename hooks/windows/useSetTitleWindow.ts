import { useSystemStore } from '../system/useSystemStore';

export const useSetTitleWindow = () => useSystemStore(({ setTitleWindow }) => setTitleWindow);
