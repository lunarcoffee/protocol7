import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const twMergeClsx = (...classes: ClassValue[]) => twMerge(clsx(classes));
