import { cn } from 'cn';
import path from 'path-browserify';
import { useState } from 'react';

import { Tooltip } from '../controls/Tooltip';
import { Breadcrumbs } from './Breadcrumbs';
import { useFileManagerStore } from './store/useFileManagerStore';
import { CurvedArrowRightIcon } from '@/components/icons/CurvedArrowRightIcon';
import { RefreshIcon } from '@/components/icons/RefreshIcon';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { IconComponentType } from '@/components/icons/types';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    return (
        <input
            value={query}
            onChange={({ target }) => setQuery(target.value)}
            placeholder="Search..."
            className={cn(
                `
                    h-6 w-50 shrink-0 rounded-full border border-x-aero-tint/58 border-t-aero-tint-dark/56
                    border-b-aero-tint/50 bg-white px-2 py-1 text-xs text-aero-tint-darkest outline
                    outline-white/70
                `,
                query === '' && 'italic',
            )}
        />
    );
};

interface ControlBarButtonProps {
    // one or the other; see below
    iconPath?: string;
    Icon?: IconComponentType;

    onClick: () => void;
    disabled?: boolean;

    label: string;
    className?: string;
}

const CircleButton = ({ iconPath, onClick, disabled = false, label, className }: ControlBarButtonProps) => (
    <div
        {...(disabled ? {} : { onClick })}
        className={cn(
            className,
            `
                flex size-6 min-w-6 rounded-full border-y border-t-aero-tint/20 border-b-white/70 px-px
                shadow-[0_0_1px] shadow-white/70
            `,
        )}
    >
        <Tooltip label={label}>
            <img
                src={getSystemIcon(iconPath!)}
                alt="Up a level"
                width={24}
                height={24}
                draggable={false}
                className={cn(
                    'scale-105 rounded-full opacity-100 brightness-100 grayscale-0 transition duration-75',
                    disabled
                        ? 'opacity-50 grayscale-50'
                        : `
                            hover:brightness-115
                            active:brightness-80 active:grayscale-25
                        `,
                )}
            />
        </Tooltip>
    </div>
);

const IconButton = ({ Icon, onClick, disabled = false, label, className }: ControlBarButtonProps) => (
    <Tooltip
        label={label}
        className={cn(
            'px-0.5 drop-shadow-[0_1px_0] drop-shadow-white',
            disabled
                ? 'text-gray-300'
                : `
                    m-auto mask-linear-135 mask-linear-to-black/65 mask-no-clip text-gray-400
                    hover:brightness-80
                    active:brightness-60
                `,
        )}
    >
        <div className={className}>{Icon && <Icon width={16} height={16} {...(disabled ? {} : { onClick })} />}</div>
    </Tooltip>
);

export const ControlBar = () => {
    const cwd = useFileManagerStore(({ cwd }) => cwd());
    const setCwd = useFileManagerStore(({ setCwd }) => setCwd);

    const cwdBack = useFileManagerStore(({ cwdBack }) => cwdBack);
    const cwdForward = useFileManagerStore(({ cwdForward }) => cwdForward);
    const canCwdBack = useFileManagerStore(({ canCwdBack }) => canCwdBack());
    const canCwdForward = useFileManagerStore(({ canCwdForward }) => canCwdForward());

    const refresh = useFileManagerStore(({ refresh }) => refresh);

    const isRoot = cwd === '/';
    const visitParent = () => void setCwd(isRoot ? cwd : path.dirname(cwd));

    return (
        <div
            className="
                z-10 flex items-center gap-1.5 rounded-b-xl border-b border-gray-400/80 bg-linear-to-b
                from-gray-100 from-30% to-aero-tint-highlight px-2 pt-1.75 pb-1.5 shadow-xs
                shadow-aero-tint-highlight
            "
        >
            <CircleButton
                iconPath="actions/media-playback-start.png"
                onClick={cwdBack}
                disabled={!canCwdBack}
                label="Back"
                className="-mr-0.5 rotate-y-180"
            />
            <CircleButton
                iconPath="actions/media-playback-start.png"
                onClick={cwdForward}
                disabled={!canCwdForward}
                label="Forward"
            />
            <IconButton
                Icon={CurvedArrowRightIcon}
                onClick={visitParent}
                disabled={isRoot}
                label="Up a level"
                className="-rotate-180 rotate-x-180"
            />
            <Breadcrumbs />
            <SearchBar />
            <IconButton Icon={RefreshIcon} onClick={refresh} label="Refresh" />
        </div>
    );
};
