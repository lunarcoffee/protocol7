import { useSystemStore } from '../system/useSystemStore';

export const useFocusWindow = () => useSystemStore(({ focusWindow }) => focusWindow);
