import { useRef } from 'react';

// cancellable and restartable timeout
export const useTimeout = (fn: () => void, cancelFn: () => void, delay: number) => {
    const timeoutRef = useRef<number>(null);

    const cancel = () => {
        cancelFn();
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };

    const restart = () => {
        cancel();
        timeoutRef.current = window.setTimeout(fn, delay);
    };

    return [cancel, restart] as const;
};
