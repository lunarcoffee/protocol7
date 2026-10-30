import { cn } from 'cn';
import { useEffect } from 'react';

import { useFileManagerStore } from './store/useFileManagerStore';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { useRecursiveSearch } from '@/hooks/useRecursiveSearch';

export const SearchBar = () => {
    const cwd = useFileManagerStore(({ cwd }) => cwd());
    const refresh = useFileManagerStore(({ refresh }) => refresh);

    const searchQuery = useFileManagerStore(({ searchQuery }) => searchQuery);
    const setSearchQuery = useFileManagerStore(({ setSearchQuery }) => setSearchQuery);
    const searchRefreshToken = useFileManagerStore(({ searchRefreshToken }) => searchRefreshToken);
    const updateSearchResults = useFileManagerStore(({ updateSearchResults }) => updateSearchResults);

    const updateQuery = (query: string) => {
        setSearchQuery(query);
        if (query === '') void refresh();
    };

    const { entries, isDone } = useRecursiveSearch(cwd, searchQuery, searchRefreshToken);

    useEffect(() => updateSearchResults({ entries, isDone }), [entries, isDone, updateSearchResults]);

    return (
        <div
            className="
                flex h-6 w-50 shrink-0 flex-row items-center rounded-full border border-x-aero-tint/58
                border-t-aero-tint-dark/56 border-b-aero-tint/50 bg-white outline outline-white/70
            "
        >
            <input
                value={searchQuery}
                onChange={({ target }) => updateQuery(target.value)}
                placeholder="Search..."
                className={cn(
                    `
                        m-0 h-full grow overflow-visible border-none bg-transparent px-2 py-1 text-xs
                        text-aero-tint-darkest outline-none
                    `,
                    searchQuery || 'italic',
                )}
            />
            {searchQuery && (
                <div
                    className="
                        mr-1 text-aero-tint/50
                        hover:text-aero-tint/65
                        active:text-aero-tint/80
                    "
                >
                    <CloseIcon width={18} height={18} onClick={() => updateQuery('')} />
                </div>
            )}
        </div>
    );
};
