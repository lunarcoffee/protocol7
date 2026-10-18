import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs/promises';
import mime from 'mime/lite';
import path from 'path';

import { HOST_ASSETS_PATH, toDataPath } from './utils.js';

const mimeTypeCache = new Map<string, string>();

export const getFileContents = async (host: string, pathSegments: string[]) => {
    const clientPath = path.join(...pathSegments);
    const filePath = path.join(HOST_ASSETS_PATH, host, toDataPath(clientPath));

    const data = new Uint8Array(await fs.readFile(filePath));

    let mimeType = mimeTypeCache.get(filePath);
    if (!mimeType) {
        // determine file type from contents, falling back to name-based detection
        const fileType = await fileTypeFromBuffer(data);
        mimeType = fileType?.mime || mime.getType(clientPath) || 'application/octet-stream';
        mimeTypeCache.set(filePath, mimeType);
    }

    return [data, mimeType] as const;
};
