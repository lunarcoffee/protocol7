import { useSystemStore } from '../system/useSystemStore';

export const useCreateWindow = () => useSystemStore(({ createWindow }) => createWindow);
