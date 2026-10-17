import { useWindowIDs } from './useWindowIDs';
import { MIN_USER_WID } from '@/stores/system/windows/WindowManager';

export const useNextWindowID = () => {
    const wids = useWindowIDs();

    let id = MIN_USER_WID;
    while (wids.includes(id)) id++;
    return id;
};
