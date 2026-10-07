import clsx from 'clsx';
import path from 'path-browserify';
import { useState } from 'react';

import { getSystemIcon } from '@/utils/getSystemIcon';

import { Breadcrumbs } from './Breadcrumbs';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    return (
        <input
            value={query}
            onChange={({ target }) => setQuery(target.value)}
            placeholder="Search..."
            className={clsx(
                `
                    h-6 w-50 shrink-0 rounded-full border border-aero-tint-dark/70 border-b-aero-tint/50
                    bg-white px-2 py-1 text-xs text-aero-tint-darkest outline outline-white/70
                `,
                query === '' && 'italic',
            )}
        />
    );
};

interface ControlBarButtonProps {
    iconPath: string;
    onClick: () => void;
    disabled?: boolean;
}

const ControlBarButton = ({ iconPath, onClick }: ControlBarButtonProps) => {
    return (
        <div onClick={onClick} className="flex size-6 min-w-6 items-center justify-center rounded-xs pl-1">
            <img src={getSystemIcon(iconPath)} alt="Up a level" width={16} />
        </div>
    );
};

export interface ControlBarProps {
    cwd: string;
    setCwd: (dir: string) => void;
}

export const ControlBar = ({ cwd, setCwd }: ControlBarProps) => {
    const isRoot = cwd === '/';

    const visitParent = () => {
        if (!isRoot) setCwd(path.dirname(cwd));
    };

    return (
        <div
            className="
                z-10 flex items-center gap-2 rounded-b-xl border-b border-aero-tint-dark/40 bg-linear-to-b
                from-gray-100 from-30% to-aero-tint-highlight px-2 pt-1.75 pb-1.5 shadow-xs
                shadow-aero-tint-highlight
            "
        >
            <ControlBarButton iconPath="actions/go-up.png" onClick={visitParent} disabled={isRoot} />
            <Breadcrumbs cwd={cwd} setCwd={setCwd} />
            <SearchBar />
        </div>
    );
};
