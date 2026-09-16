import { useSystemStore } from './useSystemStore';

export const useSystemHostname = () => useSystemStore(({ hostname }) => hostname);
