import clsx from 'clsx';
import path from 'path-browserify';

import { splitPath } from '@/filesystem/internal';
import { useBoolean } from '@/hooks/useBoolean';
import { getSystemIcon } from '@/utils/getSystemIcon';

export const rightCaretIcon = (
    <svg width="10px" height="10px" viewBox="4 4 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 7L15 12L10 17" stroke="#95a5c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface BreadcrumbSegmentProps {
    segment: string;
    onClick: () => void;

    showDivider?: boolean;
    canShrink?: boolean;
}

const BreadcrumbSegment = ({ segment, onClick, showDivider = false, canShrink = false }: BreadcrumbSegmentProps) => {
    const isRoot = segment === '/';
    const rootIconUrl = getSystemIcon('devices/drive-harddisk.png');

    return (
        <>
            <div
                onClick={onClick}
                className={clsx(
                    `
                        min-w-0 rounded-full bg-linear-to-b px-1 py-0.5 inset-ring-white outline-aero-tint/30
                        hover:to-aero-tint-highlight/50 hover:inset-ring hover:outline
                    `,
                    canShrink || 'shrink-0',
                )}
            >
                {isRoot ? (
                    <img src={rootIconUrl} alt="Root" width={16} className="mt-px" />
                ) : (
                    <p className="overflow-hidden text-nowrap text-ellipsis">{segment}</p>
                )}
            </div>
            {showDivider && <div className="shrink-0">{rightCaretIcon}</div>}
        </>
    );
};

interface BreadcrumbsProps {
    cwd: string;
    setCwd: (newValue: string) => void;
}

export const Breadcrumbs = ({ cwd, setCwd }: BreadcrumbsProps) => {
    const pathSegments = ['/', ...splitPath(cwd)];
    const pathPrefixes = pathSegments
        .slice(1)
        .reduce((prefix, segment) => [...prefix, path.join(prefix[prefix.length - 1], segment)], ['/']);

    const [isInputMode, setIsInputMode, setNotInputMode] = useBoolean();

    // TODO: support locations

    return (
        <div
            onClick={({ target, currentTarget }) => {
                if (target === currentTarget) setIsInputMode();
            }}
            className="
                h-6 w-full min-w-0 rounded-full border border-aero-tint-dark/70 border-b-aero-tint/50 bg-white
                text-xs text-aero-tint-dark italic outline outline-white/70 text-shadow-none
            "
        >
            {isInputMode ? (
                <input
                    defaultValue={cwd}
                    onKeyDown={({ key, currentTarget }) => {
                        if (key === 'Enter') {
                            setCwd(currentTarget.value);
                            currentTarget.blur();
                        }
                    }}
                    className="size-full border-none px-2 not-italic outline-none"
                    onBlur={setNotInputMode}
                    autoFocus
                />
            ) : (
                <div className="flex h-full w-fit max-w-full flex-row items-center px-1">
                    <div className="flex h-full max-w-fit min-w-0 flex-row items-center">
                        {pathSegments.map((segment, i) => {
                            const isNotLast = i < pathSegments.length - 1;
                            return (
                                <BreadcrumbSegment
                                    key={i}
                                    segment={segment}
                                    onClick={() => setCwd(pathPrefixes[i])}
                                    showDivider={isNotLast}
                                    canShrink={i > 0 && isNotLast}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
