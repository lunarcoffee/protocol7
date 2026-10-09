import { useRef } from 'react';

// cancellable and restartable timeout
export const useTimeout = (fn: () => void, cancelFn: () => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const cancel = () => {
        cancelFn();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const restart = () => {
        cancel();
        timeoutRef.current = setTimeout(fn, delay);
    };

    return [cancel, restart] as const;
};
