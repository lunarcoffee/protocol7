export const pluralize = (str: string, n: number, suffix: string = 's') => (n === 1 ? str : str + suffix);
