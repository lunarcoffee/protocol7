import path from 'path-browserify';

import { DEFAULT_ICON_PATH, SYSTEM_ICONS_ROOT } from './getIconForEntry';
import { exists } from '@/filesystem/api/exists';
import { pathToRemoteURL } from '@/filesystem/internal';

// bypasses filesystem API, directly compute URL to icon
export const getSystemIcon = (iconPath: string) => {
    iconPath = path.join(SYSTEM_ICONS_ROOT, iconPath);
    if (!exists(iconPath)) iconPath = DEFAULT_ICON_PATH;

    return pathToRemoteURL(iconPath);
};
