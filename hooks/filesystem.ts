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
      // TODO: there's somewhere else where this happens too in the code currently but is this safe?
      // this needs setFile to not be changed ever between this callback firing and readFile
      // resolving
      setFile(await readFile(path));
    });
    return () => watcher.close();
  }, [path, setFile]);

  return file;
};
