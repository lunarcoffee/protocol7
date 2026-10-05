import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime/lite';
import path from 'path-browserify';

import { exists } from '@/filesystem/api/exists';
import { readFile, ReadFileSuccess } from '@/filesystem/api/readFile';
import { readMetadata } from '@/filesystem/api/readMetadata';

export const SYSTEM_ICONS_ROOT = '/system/icons';

// path to the fallback icon
export const DEFAULT_ICON_PATH = path.join(SYSTEM_ICONS_ROOT, '/mimetypes/unknown.png');

export interface GetIconForEntryResult {
    objectURL: string;
    isCustomImage: boolean;
}

// returns a URL for a system icon representing the entry at `entryPath`
export const getIconForEntry = async (entryPath: string): Promise<GetIconForEntryResult> => {
    let imagePath = DEFAULT_ICON_PATH;
    let isCustomImage = false;

    const metadataResult = await readMetadata(entryPath);
    if (metadataResult?.ok) {
        const { type } = metadataResult.metadata;

        if (type === 'file') {
            let mimeType: string | undefined;

            // try determining the mime-type from the file contents, falling back to name-based detection
            const file = await readFile(entryPath);
            if (file?.ok) {
                const data = new Uint8Array(await file.contents());
                const fileType = await fileTypeFromBuffer(data);
                mimeType = fileType?.mime;
            }
            mimeType = mimeType ?? mime.getType(entryPath) ?? 'application/octet-stream';

            // use the icon for the corresponding mime-type, or just use the image itself for images
            if (mimeType.startsWith('image')) {
                imagePath = entryPath;
                isCustomImage = true;
            } else {
                imagePath = path.join(SYSTEM_ICONS_ROOT, `/mimetypes/${mimeType.replace(/\//g, '-')}.png`);
            }
        } else {
            imagePath = path.join(SYSTEM_ICONS_ROOT, '/places/folder-yellow.png');
        }
    }

    // final fallback (e.g., if there's no icon for a particular mime-type)
    if (!exists(imagePath)) imagePath = DEFAULT_ICON_PATH;

    // can't be bothered if this read fails lol just don't screw with system files
    const readFileResult = (await readFile(imagePath)) as ReadFileSuccess;
    return { objectURL: readFileResult.getObjectURL(), isCustomImage };
};
