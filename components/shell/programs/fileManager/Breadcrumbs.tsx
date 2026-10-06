import path from 'path-browserify';

import { splitPath } from '@/filesystem/internal';
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
}

const BreadcrumbSegment = ({ segment, onClick, showDivider = false }: BreadcrumbSegmentProps) => {
    const isRoot = segment === '/';
    const rootIconUrl = getSystemIcon('devices/drive-harddisk.png');

    return (
        <>
            <div
                onClick={onClick}
                className="
                    rounded-xs bg-linear-to-b px-1 py-0.5 inset-ring-white outline-aero-tint/30
                    hover:to-aero-tint-highlight/50 hover:inset-ring hover:outline
                "
            >
                {isRoot ? <img src={rootIconUrl} alt="Root" width={16} className="mt-px" /> : <p>{segment}</p>}
            </div>
            {showDivider && rightCaretIcon}
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

    // const inputMode = (
    //     <input
    //         value={cwd}
    //         onChange={({ target }) => setCwd(target.value)}
    //         className="
    //             h-6 w-full rounded-xs border border-aero-tint-dark/70 border-b-aero-tint/50 bg-white p-1
    //             text-xs text-aero-tint-darkest outline outline-white/70
    //         "
    //     />
    // );

    return (
        <div
            className="
                h-6 w-full rounded-xs border border-aero-tint-dark/70 border-b-aero-tint/50 bg-white text-xs
                text-aero-tint-dark italic outline outline-white/70 text-shadow-none
            "
        >
            <div className="flex size-full flex-row items-center pl-1">
                {pathSegments.map((segment, i) => {
                    return (
                        <BreadcrumbSegment
                            key={i}
                            segment={segment}
                            onClick={() => {
                                setCwd(pathPrefixes[i]);
                            }}
                            showDivider={i < pathSegments.length - 1}
                        />
                    );
                })}
            </div>
        </div>
    );
};
