import clsx from 'clsx';
import path from 'path-browserify';
import { PropsWithChildren, useState } from 'react';

import { FsEntryMetadata } from '@/filesystem';
import { readDirectory, ReadDirectorySuccess } from '@/filesystem/api/readDirectory';
import { usePromise } from '@/hooks/usePromise';
import { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';
import { formatTimestampShort } from '@/utils/formatTimestamp';
import { getIcon } from '@/utils/getIcon';
import { getIconForEntry } from '@/utils/getIconForEntry';

import { WindowFrame } from '../windows/WindowFrame';

interface PaneProps extends PropsWithChildren {
    className?: string;
}

const Pane = ({ className, children }: PaneProps) => (
    <div
        className={`
            ${className}
            border-b border-aero-tint-dark/40 bg-linear-to-b from-gray-100 from-30% to-aero-tint-highlight
        `}
    >
        {children}
    </div>
);

interface BreadcrumbsInputProps {
    cwd: string;
    setCwd: (newValue: string) => void;
}

const BreadcrumbsInput = ({ cwd, setCwd }: BreadcrumbsInputProps) => {
    return (
        <input
            value={cwd}
            onChange={({ target }) => setCwd(target.value)}
            className="
                h-6 w-full rounded-xs border border-aero-tint-dark/70 border-b-aero-tint/50 bg-white p-1
                text-xs text-aero-tint-darkest outline outline-white/70
            "
        />
    );
};

const SearchBar = ({ cwd, setCwd }: BreadcrumbsInputProps) => {
    const [query, setQuery] = useState('');
    return (
        <input
            value={query}
            onChange={({ target }) => setQuery(target.value)}
            placeholder="Search..."
            className={clsx(
                `
                    h-6 w-80 rounded-xs border border-aero-tint-dark/70 border-b-aero-tint/50 bg-white p-1
                    text-xs text-aero-tint-darkest outline outline-white/70
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

const ControlBarButton = ({ iconPath, onClick, disabled }: ControlBarButtonProps) => {
    const [upIcon] = usePromise(() => getIcon(iconPath), []);
    return (
        <div onClick={onClick} className="flex size-6 min-w-6 items-center justify-center rounded-xs pl-1">
            <img src={upIcon!} alt="Up a level" width={16} />
        </div>
    );
};

interface ControlBarProps {
    cwd: string;
    setCwd: (dir: string) => void;
}

const ControlBar = ({ cwd, setCwd }: ControlBarProps) => {
    const isRoot = cwd === '/';

    return (
        <Pane className="flex items-center gap-2 p-1.5">
            <ControlBarButton
                iconPath="actions/go-up.png"
                onClick={() => {
                    if (!isRoot) setCwd(path.dirname(cwd));
                }}
                disabled={isRoot}
            />
            <BreadcrumbsInput cwd={cwd} setCwd={setCwd} />
            <SearchBar cwd={cwd} setCwd={setCwd} />
        </Pane>
    );
};

interface FileListRowProps {
    metadata: FsEntryMetadata;
    setCwd: (dir: string) => void;
}

const FileListRow = ({ metadata: { name, path, modified }, setCwd }: FileListRowProps) => {
    const [icon] = usePromise(() => getIconForEntry(path), [path]);

    return (
        <tr
            key={path}
            onDoubleClick={() => setCwd(path)}
            className="
                rounded-xs bg-linear-to-b inset-ring-gray-100 outline-aero-tint/30
                hover:to-aero-tint-highlight/50 hover:inset-ring hover:outline
            "
        >
            {/* display a shadow under custom image icons to ensure visibility */}
            <td className={clsx('px-1', icon?.isCustomImage && 'drop-shadow-xs drop-shadow-aero-tint-dark')}>
                {icon && <img src={icon.objectURL} alt={name} width={16} />}
            </td>
            <td className="py-0.5 pr-4">{name}</td>
            <td>{formatTimestampShort(modified)}</td>
            <td />
        </tr>
    );
};

interface FileListProps extends ControlBarProps {
    dir: ReadDirectorySuccess;
}

const FileList = ({ setCwd, dir }: FileListProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    // TODO: replace this width hack it breaks when resizing while scrolled
    const [scrollFadeWidth, setScrollFadeWidth] = useState(0);

    return (
        <div
            onScroll={({ currentTarget }) => {
                setIsScrolled(currentTarget.scrollTop > 0);
                setScrollFadeWidth(currentTarget.clientWidth);
            }}
            className="
                size-full overflow-y-scroll overscroll-none border-l border-white text-aero-tint-darkest
                text-shadow-none
            "
        >
            {/* fades out the top of the list when scrolled to keep the column headers visible */}
            {isScrolled && (
                <div
                    className="fixed z-10 h-12 bg-linear-to-b from-gray-100 from-50% to-transparent"
                    style={{ width: scrollFadeWidth }}
                />
            )}
            <div className="m-2">
                <table className="w-full table-fixed border-collapse text-left text-xs">
                    <thead className="sticky top-2 z-20 text-[11px] text-aero-tint">
                        <tr>
                            {/* TODO: make these customizable (idk if this is worth the effort tho lol) */}
                            <th className="w-6 max-w-6 min-w-6" />
                            <th className="w-[40%] font-medium">Name</th>
                            <th className="w-[40%] font-medium">Last modified</th>
                            <th className="w-[calc(20%-1.5rem)] font-medium">Size</th>
                        </tr>
                        <tr className="h-1" />
                    </thead>
                    <tbody className="mt-10">
                        {Object.values(dir.entries).map((metadata) => (
                            <FileListRow key={metadata.uid} setCwd={setCwd} metadata={metadata} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const FileManager = ({ windowInfo }: PropsWithWindowInfo) => {
    const [cwd, setCwd] = useState('/');

    const [dir] = usePromise(() => readDirectory(cwd), [cwd]);
    const isLoading = !dir?.ok;

    return (
        <WindowFrame windowInfo={windowInfo}>
            <div className={clsx('flex size-full min-h-0 min-w-0 flex-col bg-gray-100', isLoading && 'cursor-wait')}>
                <ControlBar cwd={cwd} setCwd={setCwd} />
                <div className="flex size-full min-h-0 flex-row">
                    <Pane className="w-60 border-r border-aero-tint" />
                    {isLoading || <FileList cwd={cwd} setCwd={setCwd} dir={dir} />}
                </div>
            </div>
        </WindowFrame>
    );
};
