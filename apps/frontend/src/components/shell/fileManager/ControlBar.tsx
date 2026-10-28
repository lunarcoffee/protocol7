import { cn } from 'cn';
import { useState } from 'react';

import { Tooltip } from '../controls/Tooltip';
import { Breadcrumbs } from './Breadcrumbs';
import { useFileManagerStore } from './store/useFileManagerStore';
import { getSystemIcon } from '@/utils/getSystemIcon';

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
    iconPath: string;
    onClick: () => void;
    disabled?: boolean;

    label: string;
    className?: string;
}

const ControlBarButton = ({ iconPath, onClick, disabled = false, label, className }: ControlBarButtonProps) => (
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
                src={getSystemIcon(iconPath)}
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

export const ControlBar = () => {
    const cwdBack = useFileManagerStore(({ cwdBack }) => cwdBack);
    const cwdForward = useFileManagerStore(({ cwdForward }) => cwdForward);
    const canCwdBack = useFileManagerStore(({ canCwdBack }) => canCwdBack());
    const canCwdForward = useFileManagerStore(({ canCwdForward }) => canCwdForward());

    return (
        <div
            className="
                z-10 flex items-center gap-1.5 rounded-b-xl border-b border-gray-400/80 bg-linear-to-b
                from-gray-100 from-30% to-aero-tint-highlight px-2 pt-1.75 pb-1.5 shadow-xs
                shadow-aero-tint-highlight
            "
        >
            <ControlBarButton
                iconPath="actions/media-playback-start.png"
                onClick={cwdBack}
                disabled={!canCwdBack}
                label="Back"
                className="-mr-0.5 rotate-y-180"
            />
            <ControlBarButton
                iconPath="actions/media-playback-start.png"
                onClick={cwdForward}
                disabled={!canCwdForward}
                label="Forward"
            />
            <Breadcrumbs />
            <SearchBar />
        </div>
    );
};
