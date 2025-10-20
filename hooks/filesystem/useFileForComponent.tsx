import { PathLike } from 'fs';
import { JSX } from 'react';

import { FileHandle } from '@/components/contexts/system/filesystem';

import { useFile } from './useFile';

export const useFileForComponent = (
  path: PathLike,
  success: (handle: FileHandle) => JSX.Element,
  {
    loading,
    error,
  }: {
    loading?: JSX.Element;
    error?: (error: string) => JSX.Element;
  } = {},
) =>
  useFile(path, success, {
    loading: loading || <></>,
    error: error || (() => <></>),
  });
