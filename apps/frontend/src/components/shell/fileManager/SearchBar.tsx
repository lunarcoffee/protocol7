import { cn } from 'cn';
import { useState } from 'react';

import { useFileManagerStore } from './store/useFileManagerStore';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { useTimeout } from '@/hooks/useTimeout';

export const SearchBar = () => {
    const searchQuery = useFileManagerStore(({ searchQuery }) => searchQuery);
    const setSearchQuery = useFileManagerStore(({ setSearchQuery }) => setSearchQuery);
    const searchDebounceDelay = useFileManagerStore(({ settings }) => settings.searchDebounceDelay);

    const [inputValue, setInputValue] = useState('');

    // `searchQuery` sometimes changes from beyond this component so we need to keep the input box in sync
    const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
    if (searchQuery !== prevSearchQuery) {
        setPrevSearchQuery(searchQuery);
        if (searchQuery !== inputValue) setInputValue(searchQuery);
    }

    const [cancel, restart] = useTimeout(searchDebounceDelay);

    const setQuery = (query: string) => {
        setInputValue(query);

        if (query) {
            restart(() => setSearchQuery(query));
        } else {
            cancel();
            setSearchQuery('');
        }
    };

    return (
        <div
            className="
                flex h-6 w-50 shrink-0 flex-row items-center rounded-full border border-x-aero-tint/58
                border-t-aero-tint-dark/56 border-b-aero-tint/50 bg-white outline outline-white/70
            "
        >
            <input
                value={inputValue}
                onChange={({ target }) => setQuery(target.value)}
                placeholder="Search..."
                className={cn(
                    `
                        m-0 h-full grow overflow-visible border-none bg-transparent px-2 py-1 text-xs
                        text-aero-tint-darkest outline-none
                    `,
                    inputValue || 'italic',
                )}
            />
            {inputValue && (
                <div
                    className="
                        mr-1 text-aero-tint/50
                        hover:text-aero-tint/65
                        active:text-aero-tint/80
                    "
                >
                    <CloseIcon width={18} height={18} onClick={() => setQuery('')} />
                </div>
            )}
        </div>
    );
};
