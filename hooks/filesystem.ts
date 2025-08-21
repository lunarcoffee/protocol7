import fs from '@zenfs/core';
import { PathLike } from 'fs';
import { use, useEffect, useState } from 'react';

const readFile = fs.promises.readFile;

export const useFileAsync = (path: PathLike) => {
  const contents = use(readFile(path));
  const [file, setFile] = useState(contents);

  useEffect(() => {
    // TODO: handle rename
    const watcher = fs.watch(path, async () => {
      setFile(await readFile(path));
    });
    return () => watcher.close();
  }, [path]);

  return file;
};
