import fs from '@zenfs/core';
import { PathLike } from 'fs';
import { useEffect } from 'react';

import { FileResult } from '@/components/contexts/system/filesystem';

import { useFile } from './useFile';

export const useFileWatched = (
  path: PathLike,
): [FileResult | undefined, boolean, () => void] => {
  const [handle, isLoading, refresh] = useFile(path);

  useEffect(() => {
    // TODO: handle rename
    const watcher = fs.watch(path, refresh);
    return () => watcher.close();
    // `refresh` is a `useToggle` setter so it is referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return [handle, isLoading, refresh];
};
