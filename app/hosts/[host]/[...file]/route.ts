import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs/promises';
import mime from 'mime/lite';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { toDataPath } from '../route';

const mimeTypeCache = new Map<string, string>();

// returns file contents with Content-Type determined using the actual contents, instead of just the extension
export const GET = async (_: NextRequest, { params }: RouteContext<'/hosts/[host]/[...file]'>) => {
    const { host, file } = await params;

    try {
        const clientPath = path.join(...file);
        const filePath = path.join('public', host, toDataPath(clientPath));
        const data = new Uint8Array(await fs.readFile(filePath));

        let mimeType = mimeTypeCache.get(filePath);
        if (!mimeType) {
            // determine file type from contents, falling back to name-based detection
            const fileType = await fileTypeFromBuffer(data);
            mimeType = fileType?.mime || mime.getType(clientPath) || 'application/octet-stream';
            mimeTypeCache.set(filePath, mimeType);
        }

        return new NextResponse(data, { headers: { 'Content-Type': mimeType } });
    } catch {
        return new NextResponse(null, { status: 404 });
    }
};
