import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  FileHandle,
  FileResult,
  FS_SKELETON_PLACEHOLDER,
} from '@/components/contexts/system/filesystem';

import { useBoolean } from './useBoolean';
import { useSystem } from './useSystem';
import { useToggle } from './useToggle';

// actual file loading result, loading flag, and refresh trigger
export type UseFileResult = [FileResult | undefined, boolean, () => void];

const useFileRaw = (path: PathLike): UseFileResult => {
  const [system] = useSystem();
  const hostname = useMemo(() => system.hostname, [system]);
  path = `${hostname}/${path}`;

  const [handle, setHandle] = useState<FileResult>();
  const [isLoading, setLoading, setDone] = useBoolean(true);

  const [refreshSignal, triggerRefresh] = useToggle();

  const openFile = useCallback(async () => {
    const deletePlaceholderResult = async (): Promise<FileResult> => {
      await fs.rm(path, { force: true });
      return 'not found';
    };

    let buffer = await fs.readFile(path).catch(() => null);
    if (!buffer) return 'not found';

    // current file is a placeholder from the skeleton; need to fetch actual contents
    if (buffer.readUint32BE() === FS_SKELETON_PLACEHOLDER) {
      const serverFile = await fetch('hosts/' + path);

      if (!serverFile.ok) return deletePlaceholderResult();

      const data = await serverFile.formData();
      const metadata = data.get('metadata');
      const contents = data.get('contents');

      if (
        !metadata ||
        !contents ||
        !(typeof metadata === 'string') ||
        !(contents instanceof File)
      ) {
        return deletePlaceholderResult();
      }
      // TODO: parse metadata

      const bytes = await contents.arrayBuffer();
      buffer = Buffer.from(bytes);
      await fs.writeFile(path, buffer);
    }

    // for elements taking URLs (e.g. <img>)
    const blob = new Blob([Buffer.from(buffer)]);
    const objectURL = URL.createObjectURL(blob);

    return {
      read: () => buffer,
      readToObjectURL: () => objectURL,
    };
    // `refreshSignal` allows a consumer to manually trigger a reread of the file contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, refreshSignal]);

  useEffect(() => {
    let canceled = false;

    const loadHandle = async () => {
      const file = await openFile();
      if (!canceled) {
        setHandle(file);
        setDone();
      }
    };

    setLoading();
    loadHandle();

    return () => {
      canceled = true;
    };
    // `useBoolean` setters are referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFile]);

  return [handle, isLoading, triggerRefresh];
};

export const useFile = <T>(
  path: PathLike,
  success: (handle: FileHandle) => T,
  loading: T,
  error: (error: string) => T,
): [T, () => void] => {
  const [handle, isLoading, refresh] = useFileRaw(path);

  if (isLoading) return [loading, refresh];
  if (typeof handle === 'string') return [error(handle), refresh];

  // this should be safe; see the branching in the effect in `useFileRaw` above
  return [success(handle!), refresh];
};
