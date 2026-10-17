import { useSystemStore } from '../system/useSystemStore';

export const useMinimizeWindow = () => useSystemStore(({ minimizeWindow }) => minimizeWindow);
