import { cn } from 'cn';
import path from 'path-browserify';

import { useFileManagerStore } from './store/useFileManagerStore';
import { splitPath } from '@/filesystem/internal';
import { useBoolean } from '@/hooks/useBoolean';
import { getSystemIcon } from '@/utils/getSystemIcon';

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

export const Breadcrumbs = () => {
    const cwd = useFileManagerStore(({ cwd }) => cwd());
    const setCwd = useFileManagerStore(({ setCwd }) => setCwd);
    const searchQuery = useFileManagerStore(({ searchQuery }) => searchQuery);
    const locations = useFileManagerStore(({ settings }) => settings.locations);

    const pathSegments = ['/', ...splitPath(cwd)];
    const pathPrefixes = pathSegments
        .slice(1)
        .reduce((prefix, segment) => [...prefix, path.join(prefix[prefix.length - 1], segment)], ['/']);

    // the first breadcrumb is the deepest-matching location
    const locationIndex = pathPrefixes.findLastIndex((path) => locations.has(path)) ?? 0;

    const [isInputMode, setIsInputMode, setNotInputMode] = useBoolean();

    return (
        <div
            className="
                h-6 w-full min-w-0 overflow-clip rounded-full border border-x-aero-tint/58
                border-t-aero-tint-dark/56 border-b-aero-tint/50 bg-white text-xs text-aero-tint-dark italic
                outline outline-white/70 text-shadow-none
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
                    {/* TODO:  animate*/}
                    {searchQuery && <p className="shrink-0 pr-0.5 pl-1 text-[11px] text-aero-tint/80">Searching in</p>}

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

                    {/* make sure we can enter input mode even if the breadcrumbs are very long */}
                    <div
                        className="h-full min-w-1 grow cursor-text"
                        onClick={({ target, currentTarget }) => {
                            if (target === currentTarget) setIsInputMode();
                        }}
                    />
                </div>
            )}
        </div>
    );
};
