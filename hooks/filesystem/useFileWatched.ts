import fs from '@zenfs/core';
import { PathLike } from 'fs';
import { useEffect } from 'react';

import { FileHandle } from '@/components/contexts/system/filesystem';

import { RefreshTrigger, useFile, UseFileOtherCallbacks } from './useFile';

export const useFileWatched = <T, U, V>(
  path: PathLike,
  success: (handle: FileHandle) => T,
  otherCallbacks: UseFileOtherCallbacks<U, V>,
): [T | U | V, RefreshTrigger] => {
  const [result, refresh] = useFile(path, success, otherCallbacks);

  useEffect(() => {
    // TODO: handle rename
    const watcher = fs.watch(path, refresh);
    return () => watcher.close();
    // `refresh` is a `useToggle` setter so it is referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return [result, refresh];
};
