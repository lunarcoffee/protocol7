import { DependencyList, useEffect, useState } from 'react';

import { useToggle } from './useToggle';

export type RefreshTrigger = () => void;

export type UsePromiseResult<T> = [T | undefined, RefreshTrigger];

export const usePromise = <T>(promiseFn: () => Promise<T>, deps: DependencyList): UsePromiseResult<T> => {
    const [result, setResult] = useState<T>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let canceled = false;

        const awaitPromise = async () => {
            const result = await promiseFn();
            if (!canceled) setResult(result);
        };
        awaitPromise();

        return () => {
            canceled = true;
        };
        // clients should declare the relevant dependencies, including those used in `promiseFn`
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, refreshSignal]);

    return [result, triggerRefresh];
};
