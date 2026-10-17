import { useSystemStore } from '../system/useSystemStore';

export const useMaximizeWindow = () => useSystemStore(({ toggleMaximizedWindow }) => toggleMaximizedWindow);
