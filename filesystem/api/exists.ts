import { normalizePath } from '../internal';
import { resolve } from '../resolve';

export const exists = async (entryPath: string): Promise<boolean> => !!(await resolve(normalizePath(entryPath)));
