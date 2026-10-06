import path from 'path-browserify';

import { exists } from '@/filesystem/api/exists';
import { readFile, ReadFileSuccess } from '@/filesystem/api/readFile';
import { readMetadata } from '@/filesystem/api/readMetadata';

import { getMimeType } from './getMimeType';

export const SYSTEM_ICONS_ROOT = '/system/icons';

// path to the fallback icon
export const DEFAULT_ICON_PATH = path.join(SYSTEM_ICONS_ROOT, 'mimetypes/unknown.png');

export interface GetIconForEntryResult {
    objectURL: string;
    isSystemIcon: boolean;
}

// returns a URL for a system icon representing the entry at `entryPath`
export const getIconForEntry = async (entryPath: string): Promise<GetIconForEntryResult> => {
    let imagePath = DEFAULT_ICON_PATH;
    let isSystemIcon = true;

    const metadataResult = await readMetadata(entryPath);
    if (metadataResult?.ok) {
        const { type } = metadataResult.metadata;

        if (type === 'file') {
            const mimeType = await getMimeType(entryPath);

            // use the icon for the corresponding mime-type, or just use the image itself for images
            if (mimeType.startsWith('image')) {
                imagePath = entryPath;
                isSystemIcon = false;
            } else {
                imagePath = path.join(SYSTEM_ICONS_ROOT, `mimetypes/${mimeType.replace(/\//g, '-')}.png`);
            }
        } else if (type === 'directory') {
            imagePath = path.join(SYSTEM_ICONS_ROOT, 'places/folder-yellow.png');
        }
    }

    // final fallback (e.g., if there's no icon for a particular mime-type)
    if (!exists(imagePath)) {
        imagePath = DEFAULT_ICON_PATH;
        isSystemIcon = true;
    }

    // can't be bothered if this read fails lol just don't screw with system files
    const readFileResult = (await readFile(imagePath)) as ReadFileSuccess;
    return { objectURL: readFileResult.getObjectURL(), isSystemIcon };
};
