import { promises as fs } from '@zenfs/core';
import path from 'path';

// magic value indicating a file needs to be fetched from the server
export const FS_SKELETON_PLACEHOLDER = 0x94070c01;
export const FS_SKELETON_PLACEHOLDER_ARRAY = Uint8Array.from([
  0x94, 0x07, 0x0c, 0x01,
]);

export interface FileHandle {
  read: () => Buffer;
  readToObjectURL: () => string;
  // TODO: write, delete, etc
}

export type FileError = 'not found' | 'unauthorized'; // TODO: etc

export type FileResult = FileHandle | FileError;

interface Skeleton {
  dirs: string[];
  files: string[];
}

const directoryDepth = (path: string) =>
  path.split('').filter((c) => c === '/').length;

// fetches and creates local filesystem skeleton
export const createSkeletonForHost = async (hostname: string) => {
  const response = await fetch('hosts/' + hostname);
  if (!response.ok) return console.error('could not fetch fs skeleton!');

  try {
    const { dirs, files } = (await response.json()) as Skeleton;

    // create directories before files to avoid problems writing files in nonexistent directories
    await fs.mkdir(hostname);

    // also there seems to be an issue with the `recursive` option on `fs.mkdir` throwing exceptions
    // for existing directories even when set to true; this ordering will ensure we create parent
    // directories before their child directories
    dirs.sort((a, b) => directoryDepth(a) - directoryDepth(b));
    for (const dir of dirs) {
      await fs.mkdir(path.join(hostname, dir));
    }

    // now we can populate the filesystem with placeholder files
    await Promise.all(
      files.map(
        async (file) =>
          await fs.writeFile(
            path.join(hostname, file),
            FS_SKELETON_PLACEHOLDER_ARRAY,
          ),
      ),
    );
  } catch (err) {
    console.error('invalid skeleton data!', err);
  }
};

export const eraseHostFiles = async (hostname: string) => {
  try {
    await fs.rm(hostname, { recursive: true });
  } catch (err) {
    console.warn(`exception while clearing files for host ${hostname}!`, err);
  }
};
