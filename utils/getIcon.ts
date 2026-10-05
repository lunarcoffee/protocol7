import path from 'path-browserify';

import { exists } from '@/filesystem/api/exists';
import { readFile } from '@/filesystem/api/readFile';

import { DEFAULT_ICON_PATH, SYSTEM_ICONS_ROOT } from './getIconForEntry';

export const getIcon = async (iconPath: string) => {
    iconPath = path.join(SYSTEM_ICONS_ROOT, iconPath);
    if (!exists(iconPath)) iconPath = DEFAULT_ICON_PATH;

    const readFileResult = await readFile(iconPath);
    if (!readFileResult.ok) return;

    return readFileResult.getObjectURL();
};
