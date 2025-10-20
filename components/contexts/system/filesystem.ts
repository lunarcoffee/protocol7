import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';
import path from 'path';

export interface FileHandle {
  read: () => Buffer;
  readToObjectURL: () => string;
  // TODO: write, delete, etc
}

export type OpenFileError = 'not found'; // TODO: etc

export type OpenFileResult = FileHandle | OpenFileError;

export interface DirectoryHandle {
  entries: () => string[];
  entriesAbsolute: () => string[];
}

export type OpenDirectoryError = 'not found';

export type OpenDirectoryResult = DirectoryHandle | OpenDirectoryError;

export interface Skeleton {
  dirs: string[];
  files: string[];
  manifest: {
    // files that should be fetched before displaying the shell
    prefetch: string[];
  };
}

// a file containing this value indicates it was generated as part of the skeleton; the real
// contents need to be fetched from the server
export const FS_SKELETON_PLACEHOLDER = 0x94070c01;
export const FS_SKELETON_PLACEHOLDER_ARRAY = Uint8Array.from([
  0x94, 0x07, 0x0c, 0x01,
]);

const directoryDepth = (path: string) =>
  path.split('').filter((c) => c === '/').length;

// fetches and creates a local filesystem skeleton and performs any work specified by the manifest
// for the given host
export const createSkeletonForHost = async (hostname: string) => {
  try {
    const response = await fetch('hosts/' + hostname);
    const { dirs, files, manifest } = (await response.json()) as Skeleton;

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

    await Promise.all(
      manifest.prefetch.map(
        async (file) => await fetchFileFromHost(hostname, file),
      ),
    );
  } catch (err) {
    console.error('exception while creating skeleton for host!', err);
  }
};

export const eraseHostFiles = async (hostname: string) => {
  try {
    await fs.rm(hostname, { recursive: true });
  } catch (err) {
    console.warn('exception while erasing files for host!', err);
  }
};

// fetches a copy of the file at `path` from the server and writes it to the local filesystem
export const fetchFileFromHost = async (hostname: string, path: PathLike) => {
  try {
    const hostQualifiedPath = `${hostname}/${path}`;
    const serverFile = await fetch('hosts/' + hostQualifiedPath);

    if (!serverFile.ok) return;

    const data = await serverFile.formData();
    const metadata = data.get('metadata');
    const contents = data.get('contents');

    if (
      !metadata ||
      !contents ||
      !(typeof metadata === 'string') ||
      !(contents instanceof File)
    ) {
      return;
    }

    // TODO: parse metadata
    const bytes = await contents.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(hostQualifiedPath, buffer);

    return buffer;
  } catch (err) {
    console.warn('exception while fetching file from host!', err);
  }
};
