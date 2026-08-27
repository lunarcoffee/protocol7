import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

interface GetParams {
    host: string;
    file: string[];
}

// TODO: investigate routecontext? doesnt seem to work currently
export const GET = async (_: NextRequest, { params }: { params: Promise<GetParams> }) => {
    const { host, file } = await params;

    try {
        const staticPath = path.join('static', host, ...file);
        const data = await fs.readFile(staticPath);
        const buffer = Buffer.from(data);

        const responseData = new FormData();
        // TODO: annoying copy here maybe theres a better solution but im sleepy rn this is good enough
        responseData.append('contents', new Blob([buffer]));
        // TODO: (related to comment in other route.ts) eventually may decide this is unnecessary due to already sending
        // metadata in the skeleton (it would be necessary if we want to account for te skeleton metadata and server
        // copy getting out of sync but idk if that's desirable)
        responseData.append(
            'metadata',
            JSON.stringify({
                name: file[file.length - 1],
                // TODO: date modified etc (actually fetch from metadata files)
            }),
        );

        return new NextResponse(responseData);
    } catch {
        // TODO: make more nuanced
        return new NextResponse(null, { status: 404 });
    }
};
