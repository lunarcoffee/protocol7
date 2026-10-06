import clsx from 'clsx';
import { Dispatch, PropsWithChildren, SetStateAction, useState } from 'react';

import { FsEntryMetadata } from '@/filesystem';
import { ReadDirectoryResult } from '@/filesystem/api/readDirectory';
import { usePromise } from '@/hooks/usePromise';
import { formatSizeBytes } from '@/utils/formatSizeBytes';
import { formatTimestampShort } from '@/utils/formatTimestamp';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';
import { keyToCompareFn } from '@/utils/keyToCompareFn';

import { rightCaretIcon } from './Breadcrumbs';
import { FavoriteLocations } from './FileManager';
import { HeadingText } from './HeadingText';

const nameCompareFn = keyToCompareFn<FsEntryMetadata>(({ name }) => [name]);
const modifiedCompareFn = keyToCompareFn<FsEntryMetadata>(({ modified }) => [modified]);
const sizeCompareFn = keyToCompareFn<FsEntryMetadata>((metadata) => [metadata.type === 'file' ? metadata.size : 0]);

// mapping columns and the comparison functions they use for ordering entries
const FILE_TABLE_COLUMNS = {
    ['Name']: { compareFn: nameCompareFn, className: 'w-[50%]' },
    ['Last modified']: { compareFn: modifiedCompareFn, className: 'w-[25%]' },
    ['Size']: { compareFn: sizeCompareFn, className: 'w-[calc(25%-1.5rem)]' },
};

type FileTableColumnName = keyof typeof FILE_TABLE_COLUMNS;

interface FileTableColumnHeaderProps extends PropsWithChildren {
    // current table state values
    isAscending: boolean;
    currentSortColumn: FileTableColumnName;

    // the name of this particular column
    thisSortColumn: FileTableColumnName;

    setIsAscending: Dispatch<SetStateAction<boolean>>;
    setSortColumn: (column: FileTableColumnName) => void;
}

const FileTableColumnHeader = ({
    isAscending,
    currentSortColumn,
    thisSortColumn,
    setIsAscending,
    setSortColumn,
    children,
}: FileTableColumnHeaderProps) => {
    const currentlySortingByThisColumn = currentSortColumn === thisSortColumn;

    const updateSortSettings = () => {
        // toggle direction if this column is currently selected; otherwise, always set ascending
        if (currentlySortingByThisColumn) {
            setIsAscending((value) => !value);
        } else {
            setSortColumn(thisSortColumn);
            setIsAscending(true);
        }
    };

    return (
        <div className="relative">
            {/* sort direction indicator (downwards caret means ascending) */}
            {currentlySortingByThisColumn && (
                <div className={clsx('absolute left-[50%] -mt-2', isAscending ? 'rotate-90' : '-rotate-90')}>
                    {rightCaretIcon}
                </div>
            )}
            <HeadingText onClick={updateSortSettings} className="cursor-pointer">
                {children}
            </HeadingText>
        </div>
    );
};

interface FileTableRowProps {
    metadata: FsEntryMetadata;
    setCwd: (dir: string) => void;
    locations?: FavoriteLocations;
}

const FileTableRow = ({ metadata, setCwd, locations }: FileTableRowProps) => {
    const { type, name, path, modified } = metadata;
    const isDirectory = type === 'directory';

    const [icon] = usePromise(async () => {
        // if this entry is a favorite location, use the icon for that instead
        const location = locations?.get(path);
        if (location) return { objectURL: getSystemIcon(location.icon), isSystemIcon: true };

        return await getIconForEntry(path);
    }, [locations, path]);

    return (
        <tr
            key={path}
            {...(isDirectory && { onDoubleClick: () => setCwd(path) })}
            className="
                rounded-xs bg-linear-to-b inset-ring-gray-100 outline-aero-tint/30
                hover:to-aero-tint-highlight/50 hover:inset-ring hover:outline
            "
        >
            {/* display a shadow under custom image icons to ensure visibility */}
            <td className={clsx('px-1', icon?.isSystemIcon || 'drop-shadow-xs drop-shadow-aero-tint-dark')}>
                {icon && <img src={icon.objectURL} alt={name} width={16} />}
            </td>
            <td className="overflow-hidden py-0.5 pr-4 text-nowrap text-ellipsis">{name}</td>
            <td>{formatTimestampShort(modified)}</td>
            <td>{isDirectory || formatSizeBytes(metadata.size)}</td>
        </tr>
    );
};

const PlaceholderRow = ({ children }: PropsWithChildren) => (
    <tr>
        <td className="p-6 text-center text-xs text-aero-tint/50" colSpan={4}>
            {children}
        </td>
    </tr>
);

export interface FileTableProps {
    setCwd: (dir: string) => void;
    dir?: ReadDirectoryResult;
    locations?: FavoriteLocations;
}

export const FileTable = ({ setCwd, dir, locations }: FileTableProps) => {
    const [isScrolled, setIsScrolled] = useState(false);

    const [sortColumn, setSortColumn] = useState<FileTableColumnName>('Name');
    const [isAscending, setIsAscending] = useState(true);

    const isDirLoading = !dir?.ok;
    const entries = isDirLoading ? null : Object.values(dir.entries);
    const hasEntries = !isDirLoading && entries!.length > 0;

    // split directories and files so we can process them separately
    const directories = entries?.filter(({ type }) => type === 'directory');
    const files = entries?.filter(({ type }) => type === 'file');

    const sortFn = FILE_TABLE_COLUMNS[sortColumn].compareFn(!isAscending);
    directories?.sort(sortFn);
    files?.sort(sortFn);

    return (
        <div
            onScroll={({ currentTarget }) => setIsScrolled(currentTarget.scrollTop > 0)}
            className="
                size-full overflow-y-scroll overscroll-none border-l border-white text-aero-tint-darkest
                contain-layout text-shadow-none
            "
        >
            {/* fades out the top of the list when scrolled to keep the column headers visible */}
            {isScrolled && (
                <div
                    className="
                        sticky top-0 z-10 -mt-10 h-10 w-full bg-linear-to-b from-gray-100 from-60%
                        to-transparent
                    "
                />
            )}
            <div className="m-2">
                <table className="w-full table-fixed border-collapse text-left text-xs">
                    {/* these table headers allow configuring the sorting */}
                    <thead className="sticky top-2 z-20">
                        <tr>
                            <th className="w-6 max-w-6 min-w-6" />
                            {Object.entries(FILE_TABLE_COLUMNS).map(([column, { className }]) => (
                                <th key={column} className={className}>
                                    <FileTableColumnHeader
                                        isAscending={isAscending}
                                        currentSortColumn={sortColumn}
                                        thisSortColumn={column as FileTableColumnName}
                                        setIsAscending={setIsAscending}
                                        setSortColumn={setSortColumn}
                                    >
                                        {column}
                                    </FileTableColumnHeader>
                                </th>
                            ))}
                        </tr>
                        <tr className="h-1" />
                    </thead>
                    {/* actual list of entries */}
                    <tbody>
                        {isDirLoading ? (
                            <PlaceholderRow>Loading...</PlaceholderRow>
                        ) : !hasEntries ? (
                            <PlaceholderRow>No items</PlaceholderRow>
                        ) : (
                            // always show directories first
                            [...directories!, ...files!].map((metadata) => (
                                <FileTableRow
                                    key={metadata.uid}
                                    setCwd={setCwd}
                                    metadata={metadata}
                                    locations={locations}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
