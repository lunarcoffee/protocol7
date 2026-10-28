import { useRef, useState } from 'react';

import { useBoolean } from './useBoolean';
import { usePromise } from './usePromise';
import { readDirectory } from '@/filesystem/api/readDirectory';

import type { FsEntryMetadata } from '@protocol7/filesystem-types';

export interface RecursiveSearchResult {
    isDone: boolean;
    entries: FsEntryMetadata[];
}

export const useRecursiveSearch = (dirPath: string, query: string): RecursiveSearchResult => {
    const prevDirPath = useRef(dirPath);
    const prevQuery = useRef(query);

    const [isDone, setDone, setNotDone] = useBoolean();
    const [entries, setEntries] = useState<FsEntryMetadata[]>([]);

    usePromise(
        async (signal) => {
            if (dirPath === prevDirPath.current && query === prevQuery.current) return;

            prevDirPath.current = dirPath;
            prevQuery.current = query;
            if (query === '') return;

            setNotDone();
            setEntries([]);

            // simple depth-first traversal
            const searchDirs = [dirPath];
            while (searchDirs.length > 0) {
                const dir = await readDirectory(searchDirs.pop()!);
                if (!dir?.ok) continue;

                const entries = Object.values(dir.entries);
                const normalizedQuery = query.toLocaleLowerCase();

                // batch updates per directory
                const newSearchDirs = entries.filter(({ type }) => type === 'directory').map(({ path }) => path);
                const newEntries = entries.filter(({ name }) => name.toLocaleLowerCase().includes(normalizedQuery));

                if (signal.aborted) return;

                searchDirs.push(...newSearchDirs);
                setEntries((entries) => [...entries, ...newEntries]);
            }

            setDone();
        },
        [dirPath, query, setDone, setNotDone, setEntries],
    );

    return { isDone, entries };
};
