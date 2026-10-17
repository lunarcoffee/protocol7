const compareSingle = <T extends string | number>(a: T, b: T): number => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);

    return 0;
};

export type CompareFn<T> = (descending?: boolean) => (a: T, b: T) => number;

// turns the array-valued `key` function into something usable with the standard sorting methods; arrays are compared
// element-wise from left to right like in every other language ever
export const keyToCompareFn =
    <T>(key: (value: T) => (string | number)[]): CompareFn<T> =>
    (descending: boolean = false) =>
    (a: T, b: T) => {
        const aKey = key(a);
        const bKey = key(b);

        // assume `key` returns an array of the same length for any input
        for (let i = 0; i < aKey.length; i++) {
            const compare = compareSingle(aKey[i], bKey[i]);
            if (compare !== 0) return descending ? -compare : compare;
        }
        return 0;
    };
