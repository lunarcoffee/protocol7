import { useProcessIDs } from './useProcessIDs';

export const useNextProcessID = () => {
    const pids = useProcessIDs();

    let id = 0;
    while (pids.includes(id)) id++;
    return id;
};
