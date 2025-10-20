import { promises as fs } from '@zenfs/core';
import { PathLike } from 'fs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DirectoryHandle,
  OpenDirectoryResult,
} from '@/components/contexts/system/filesystem';

import { useBoolean } from '../useBoolean';
import { useSystem } from '../useSystem';
import { useToggle } from '../useToggle';
import { RefreshTrigger, UseFileOtherCallbacks } from './useFile';

export type UseDirectoryResult = [
  OpenDirectoryResult | undefined,
  boolean,
  RefreshTrigger,
];

const useDirectoryRaw = (path: PathLike): UseDirectoryResult => {
  const [system] = useSystem();
  const hostname = useMemo(() => system.hostname, [system]);
  const hostQualifiedPath = `${hostname}/${path}`;

  const [handle, setHandle] = useState<OpenDirectoryResult>();
  const [isLoading, setLoading, setDone] = useBoolean(true);

  const [refreshSignal, triggerRefresh] = useToggle();

  const openDirectory = useCallback(async () => {
    const dirents = await fs.readdir(hostQualifiedPath).catch(() => null);
    if (!dirents) return 'not found';

    dirents.sort();

    return {
      entries: () => dirents,
      entriesAbsolute: () => dirents.map((dirent) => `${path}/${dirent}`),
    };
    // `refreshSignal` allows a consumer to manually trigger a reread of the directory contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, hostQualifiedPath, refreshSignal]);

  useEffect(() => {
    let canceled = false;

    const loadHandle = async () => {
      const file = await openDirectory();
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
  }, [openDirectory]);

  return [handle, isLoading, triggerRefresh];
};

export const useDirectory = <T, U, V>(
  path: PathLike,
  success: (handle: DirectoryHandle) => T,
  { loading, error }: UseFileOtherCallbacks<U, V>,
): [T | U | V, () => void] => {
  const [handle, isLoading, refresh] = useDirectoryRaw(path);

  if (isLoading) return [loading, refresh];
  if (typeof handle === 'string') return [error(handle), refresh];

  // this should be safe; see the branching in the effect in `useDirectoryRaw` above
  return [success(handle!), refresh];
};
