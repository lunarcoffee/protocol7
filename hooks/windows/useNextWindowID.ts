import { MIN_USER_WID } from '@/stores/system/windows/WindowManager';

import { useWindowIDs } from './useWindowIDs';

export const useNextWindowID = () => {
    const wids = useWindowIDs();

    let id = MIN_USER_WID;
    while (wids.includes(id)) id++;
    return id;
};
