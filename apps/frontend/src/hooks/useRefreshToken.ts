import { useState } from 'react';

export type RefreshToken = number;
export type RefreshSignal = () => void;

export const useRefreshToken = (): [RefreshToken, RefreshSignal] => {
    const [token, setToken] = useState(0);
    const refresh = () => setToken((token) => token + 1);

    return [token, refresh];
};
