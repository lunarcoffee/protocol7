import { promises as fs } from '@zenfs/core';
import path from 'path';

import { isStringArray } from '@/utils/isStringArray';

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

// fetches and creates local filesystem skeleton
export const createSkeletonForHost = async (hostname: string) => {
  const response = await fetch('hosts/' + hostname);
  if (!response.ok) return console.error('could not fetch fs skeleton!');

  try {
    const skeleton = await response.json();
    if (!('dirs' in skeleton && 'files' in skeleton)) throw new TypeError();

    const { dirs, files } = skeleton;
    if (!isStringArray(dirs) || !isStringArray(files)) throw new TypeError();

    console.debug('creating directory skeleton');
    await fs.mkdir(hostname);
    await Promise.all(
      dirs.map(async (dir) => await fs.mkdir(path.join(hostname, dir))),
    );

    console.debug('creating file skeletons');
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
