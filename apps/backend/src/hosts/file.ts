import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs/promises';
import { LRUCache } from 'lru-cache/raw';
import mime from 'mime/lite';
import path from 'path';

import { config } from '../config.js';
import { logger } from '../logger.js';
import { toDataPath } from '../utils.js';

// file contents and mime-type
type HostFile = readonly [Uint8Array<ArrayBuffer>, string];

const fileCache = new LRUCache<string, HostFile>({
    maxSize: config.HOST_ASSETS_CACHE_BYTES,
    sizeCalculation: ({ length }) => length,
});

const readAndCacheFile = async (host: string, clientPath: string) => {
    const filePath = path.join(config.HOST_ASSETS_PATH, host, toDataPath(clientPath));

    const data = new Uint8Array(await fs.readFile(filePath));

    // determine file type from contents, falling back to name-based detection
    const fileType = await fileTypeFromBuffer(data);
    const mimeType = fileType?.mime || mime.getType(clientPath) || 'application/octet-stream';

    const hostFile = [data, mimeType] as const;
    fileCache.set(filePath, hostFile);
    return hostFile;
};

export const invalidateCachedFile = (filePath: string) => {
    if (fileCache.delete(filePath)) logger.info({ filePath }, 'invalidated file cache entry');
};

export const getFile = async (host: string, clientPath: string) => {
    const filePath = path.join(config.HOST_ASSETS_PATH, host, toDataPath(clientPath));
    return fileCache.get(filePath) ?? (await readAndCacheFile(host, clientPath));
};
