import { Dirent } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import { Skeleton } from '@/components/stores/system/filesystem';

interface GetParams {
    host: string;
}

// serves filesystem skeleton
// TODO: investigate routecontext? doesnt seem to work currently
export const GET = async (_: Request, { params }: { params: Promise<GetParams> }) => {
    const { host } = await params;

    // TODO: maybe generate this statically for performance
    const fileRoot = path.join('assets', host);
    const dirents = await fs.readdir(fileRoot, {
        recursive: true,
        withFileTypes: true,
    });

    const filterToPaths = (fn: (dirent: Dirent) => boolean) =>
        dirents.filter(fn).map((dirent) => {
            const dirSegments = dirent.parentPath.split('/');
            return path.join(...dirSegments.slice(2), dirent.name);
        });

    const dirs = filterToPaths((dirent) => dirent.isDirectory());
    const files = filterToPaths((dirent) => !dirent.isDirectory());

    const manifest = JSON.parse(
        await fs.readFile(path.join(fileRoot, 'manifest.json'), {
            encoding: 'utf-8',
        }),
    );

    //TODO: this will eventually have to include metadata as well
    const skeleton: Skeleton = { dirs, files, manifest };
    return Response.json(skeleton);
};
