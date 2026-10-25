import { type DependencyList, useEffect, useState } from 'react';

import { useToggle } from './useToggle';

export type RefreshTrigger = () => void;

export type UsePromiseResult<T> = [T | undefined, RefreshTrigger];

export const usePromise = <T>(
    promiseFn: (signal: AbortSignal) => Promise<T>,
    deps: DependencyList,
    cleanupFn?: () => void,
): UsePromiseResult<T> => {
    const [result, setResult] = useState<T>();
    const [refreshSignal, triggerRefresh] = useToggle();

    useEffect(() => {
        let controller = new AbortController();

        const awaitPromise = async () => {
            const result = await promiseFn(controller.signal);
            if (!controller.signal.aborted) setResult(result);
        };
        void awaitPromise();

        return () => {
            controller.abort();
            cleanupFn?.();
        };
        // clients should declare the relevant dependencies, including those used in `promiseFn`
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, refreshSignal]);

    return [result, triggerRefresh];
};
