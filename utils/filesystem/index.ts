import { promises as fs } from '@zenfs/core';
import { Mutex } from 'async-mutex';
import { PathLike } from 'fs';
import path from 'path';

export interface Skeleton {
    dirs: string[];
    files: string[];
    manifest: {
        // files that should be fetched before displaying the shell
        prefetch: string[];
    };
}

// a file containing this value indicates it was generated as part of the skeleton; the real contents need to be fetched
// from the server
export const FS_SKELETON_PLACEHOLDER = 0x94070c01;
export const FS_SKELETON_PLACEHOLDER_ARRAY = Uint8Array.from([0x94, 0x07, 0x0c, 0x01]);

// fetches and creates a local filesystem skeleton and performs any work specified by the manifest for the given host
export const createSkeleton = async (hostname: string) => {
    try {
        const response = await fetch('hosts/' + hostname);
        const { dirs, files, manifest } = (await response.json()) as Skeleton;

        // create directories before files to avoid problems writing files in nonexistent directories
        await fs.mkdir(hostname, { recursive: true });
        await Promise.all(dirs.map((dir) => fs.mkdir(path.join(hostname, dir), { recursive: true })));

        await Promise.all(
            files.map((file) =>
                manifest.prefetch.includes(file)
                    ? fetchFileForHost(hostname, file)
                    : fs.writeFile(path.join(hostname, file), FS_SKELETON_PLACEHOLDER_ARRAY),
            ),
        );
    } catch (err) {
        console.error('exception while creating skeleton for host!', err);
    }
};

export const eraseData = async (hostname: string) => {
    try {
        if (await fs.exists(hostname)) await fs.rm(hostname, { recursive: true });
    } catch (err) {
        console.warn('exception while erasing data for host!', err);
    }
};

const resetHostMutex = new Mutex();

export const resetHost = async (hostname: string) => {
    await resetHostMutex.runExclusive(async () => {
        await eraseData(hostname);
        await createSkeleton(hostname);
    });
};

// fetches a copy of the file at `path` from the server and writes it to the local filesystem
export const fetchFileForHost = async (hostname: string, path: PathLike) => {
    try {
        const hostQualifiedPath = `${hostname}/${path}`;
        const serverFile = await fetch('hosts/' + hostQualifiedPath);

        if (!serverFile.ok) return;

        const data = await serverFile.formData();
        const metadata = data.get('metadata');
        const contents = data.get('contents');

        if (!metadata || !contents || !(typeof metadata === 'string') || !(contents instanceof File)) {
            return;
        }

        // TODO: parse metadata
        const bytes = await contents.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(hostQualifiedPath, buffer);

        return buffer;
    } catch (err) {
        console.warn('exception while fetching file from server!', err);
    }
};
