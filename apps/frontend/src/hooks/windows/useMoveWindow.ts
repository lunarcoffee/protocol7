import { useSystemStore } from '../system/useSystemStore';

export const useMoveWindow = () => useSystemStore(({ moveWindow }) => moveWindow);
