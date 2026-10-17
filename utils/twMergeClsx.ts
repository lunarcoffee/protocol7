import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const twMergeClsx = (...classes: ClassValue[]) => twMerge(clsx(classes));
