export type CallbackWithSignal<T> = (signal: AbortSignal) => Promise<T>;

export const makeCancelSignal = () => {
    let controller = new AbortController();

    const cancel = () => {
        controller.abort();
        controller = new AbortController();
    };

    const cancelAndRerun = <T>(fn: CallbackWithSignal<T>) => {
        cancel();
        return fn(controller.signal);
    };

    return [cancel, cancelAndRerun] as const;
};
