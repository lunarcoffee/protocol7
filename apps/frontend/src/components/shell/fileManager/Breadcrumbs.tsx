import { cn } from 'cn';
import path from 'path-browserify';

import { Tooltip } from '../controls/Tooltip';
import { useFileManagerStore } from './store/useFileManagerStore';
import { CurvedArrowRightIcon } from '@/components/icons/CurvedArrowRightIcon';
import { RefreshIcon } from '@/components/icons/RefreshIcon';
import { splitPath } from '@/filesystem/internal';
import { useBoolean } from '@/hooks/useBoolean';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { IconComponentType } from '@/components/icons/types';
import type { SavedLocation } from '@/stores/fileManager/store';

export const rightCaretIcon = (
    <svg width="10px" height="10px" viewBox="4 4 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 7L15 12L10 17" stroke="#95a5c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface BreadcrumbSegmentProps {
    segment?: string;
    location?: SavedLocation;
    onClick: () => void;

    showDivider?: boolean;
    canShrink?: boolean;
}

const BreadcrumbSegment = ({
    segment,
    location,
    onClick,
    showDivider = false,
    canShrink = false,
}: BreadcrumbSegmentProps) => (
    <>
        <div
            onClick={onClick}
            className={cn(
                `
                    min-w-0 rounded-full bg-linear-to-b px-1 py-0.5 inset-ring-white outline-aero-tint/30
                    hover:to-aero-tint-highlight/50 hover:inset-ring hover:outline
                `,
                canShrink || 'shrink-0',
            )}
        >
            {location ? (
                <div className="flex flex-row items-center gap-1">
                    <img src={getSystemIcon(location.icon)} alt={location.label} width={16} className="mt-px" />
                    <p>{location.label}</p>
                </div>
            ) : (
                <p className="overflow-hidden text-nowrap text-ellipsis">{segment ?? ''}</p>
            )}
        </div>
        {showDivider && <div className="shrink-0">{rightCaretIcon}</div>}
    </>
);

interface BreadcrumbIconButtonProps {
    Icon: IconComponentType;
    onClick: () => void;
    disabled?: boolean;

    label: string;
    className?: string;
}

const BreadcrumbIconButton = ({ Icon, onClick, disabled = false, label, className }: BreadcrumbIconButtonProps) => (
    <Tooltip
        label={label}
        className={
            disabled
                ? 'text-gray-300'
                : `
                    m-auto mask-linear-135 mask-linear-to-black/65 mask-no-clip text-gray-400
                    hover:brightness-80
                    active:brightness-60
                `
        }
    >
        <div className={className}>
            <Icon width={12} height={12} {...(disabled ? {} : { onClick })} />
        </div>
    </Tooltip>
);

export const Breadcrumbs = () => {
    const cwd = useFileManagerStore(({ cwd }) => cwd());
    const setCwd = useFileManagerStore(({ setCwd }) => setCwd);
    const locations = useFileManagerStore(({ settings }) => settings.locations);
    const refresh = useFileManagerStore(({ refresh }) => refresh);

    const pathSegments = ['/', ...splitPath(cwd)];
    const pathPrefixes = pathSegments
        .slice(1)
        .reduce((prefix, segment) => [...prefix, path.join(prefix[prefix.length - 1], segment)], ['/']);

    // the first breadcrumb is the deepest-matching location
    const locationIndex = pathPrefixes.findLastIndex((path) => locations.has(path)) ?? 0;

    const [isInputMode, setIsInputMode, setNotInputMode] = useBoolean();

    const isRoot = cwd === '/';
    const visitParent = () => void setCwd(isRoot ? cwd : path.dirname(cwd));

    return (
        <div
            className="
                h-6 w-full min-w-0 rounded-full border border-x-aero-tint/58 border-t-aero-tint-dark/56
                border-b-aero-tint/50 bg-white text-xs text-aero-tint-dark italic outline outline-white/70
                text-shadow-none
            "
        >
            {isInputMode ? (
                <input
                    defaultValue={cwd}
                    onKeyDown={({ key, currentTarget }) => {
                        if (key === 'Enter') {
                            void setCwd(currentTarget.value);
                            currentTarget.blur();
                        }
                    }}
                    className="size-full border-none px-2 not-italic outline-none"
                    onBlur={setNotInputMode}
                    autoFocus
                />
            ) : (
                <div className="flex h-full max-w-full cursor-auto flex-row items-center px-1">
                    <div className="flex h-full max-w-fit min-w-0 flex-row items-center">
                        {pathSegments.map((segment, i) => {
                            if (i < locationIndex) return null;

                            const isNotLast = i < pathSegments.length - 1;
                            return (
                                <BreadcrumbSegment
                                    key={pathPrefixes[i]}
                                    {...(i === locationIndex
                                        ? { location: locations?.get(pathPrefixes[i]) }
                                        : { segment })}
                                    onClick={() => void setCwd(pathPrefixes[i])}
                                    showDivider={isNotLast}
                                    canShrink={i > locationIndex && isNotLast}
                                />
                            );
                        })}
                    </div>

                    <div
                        className="h-full min-w-1 grow cursor-text"
                        onClick={({ target, currentTarget }) => {
                            if (target === currentTarget) setIsInputMode();
                        }}
                    />

                    <div className="flex flex-row gap-2 px-1">
                        <BreadcrumbIconButton
                            Icon={CurvedArrowRightIcon}
                            onClick={visitParent}
                            disabled={isRoot}
                            label="Up a level"
                            className="-rotate-180 rotate-x-180"
                        />
                        <BreadcrumbIconButton Icon={RefreshIcon} onClick={refresh} label="Refresh" />
                    </div>
                </div>
            )}
        </div>
    );
};
