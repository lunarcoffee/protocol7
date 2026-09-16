import { useSystemStore } from '../system/useSystemStore';

export const useResizeWindow = () => useSystemStore(({ resizeWindow }) => resizeWindow);
