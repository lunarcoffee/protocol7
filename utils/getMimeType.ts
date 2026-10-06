import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';

import { readFile } from '@/filesystem/api/readFile';

export const getMimeType = async (entryPath: string) => {
    let mimeType: string | undefined;

    // try determining the mime-type from the file contents
    const file = await readFile(entryPath);
    if (file?.ok) {
        const data = new Uint8Array(await file.contents());
        const fileType = await fileTypeFromBuffer(data);
        mimeType = fileType?.mime;
    }

    // fall back to name-based detection
    return mimeType ?? mime.getType(entryPath) ?? 'application/octet-stream';
};
