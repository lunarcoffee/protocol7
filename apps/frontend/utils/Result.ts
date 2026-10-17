export type Result<T, E> = (T & { ok: true }) | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, ...value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
