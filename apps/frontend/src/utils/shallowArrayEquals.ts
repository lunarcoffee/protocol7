import { shallow } from 'zustand/shallow';

export const shallowArrayEquals = <T>(array1?: T[], array2?: T[]) =>
    (array1 === undefined && array2 === undefined) ||
    (array1 !== undefined &&
        array2 !== undefined &&
        array1.length === array2.length &&
        array1.every((elem, i) => shallow(elem, array2[i])));
