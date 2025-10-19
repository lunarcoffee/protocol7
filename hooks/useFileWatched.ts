import fs from '@zenfs/core';
import { PathLike } from 'fs';
import { useEffect } from 'react';

import { FileHandle } from '@/components/contexts/system/filesystem';

import { useFile } from './useFile';

export const useFileWatched = <T>(
  path: PathLike,
  success: (handle: FileHandle) => T,
  loading: T,
  error: (error: string) => T,
) => {
  const [result, refresh] = useFile(path, success, loading, error);

  useEffect(() => {
    // TODO: handle rename
    const watcher = fs.watch(path, refresh);
    return () => watcher.close();
    // `refresh` is a `useToggle` setter so it is referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return [result, refresh];
};
