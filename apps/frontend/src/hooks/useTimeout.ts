import { useRef } from 'react';

// cancellable and restartable timeout
export const useTimeout = (delay: number, defaultFn?: () => void, cancelFn?: () => void) => {
    const timeoutRef = useRef<number>(null);

    const cancel = () => {
        cancelFn?.();
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };

    const restart = (fn?: () => void) => {
        cancel();
        timeoutRef.current = window.setTimeout(fn ?? defaultFn!, delay);
    };

    return [cancel, restart] as const;
};
