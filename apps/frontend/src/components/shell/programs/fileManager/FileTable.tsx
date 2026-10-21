import { cn } from 'cn';
import { type Dispatch, type MouseEvent, type PropsWithChildren, type SetStateAction, useState } from 'react';

import { DragSelectContainer } from '../../controls/DragSelectContainer';
import { Tooltip } from '../../controls/Tooltip';
import { rightCaretIcon } from './Breadcrumbs';
import { HeadingText } from './HeadingText';
import { useDragSelectReducer } from '@/hooks/useDragSelectReducer';
import { usePromise } from '@/hooks/usePromise';
import { formatMetadataTooltip } from '@/utils/formatMetadataTooltip';
import { formatSizeBytes } from '@/utils/formatSizeBytes';
import { formatTimestampShort } from '@/utils/formatTimestamp';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';
import { keyToCompareFn } from '@/utils/keyToCompareFn';
import { shallowArrayEquals } from '@/utils/shallowArrayEquals';

import type { SavedLocations } from './FileManager';
import type { ReadDirectoryResult } from '@/filesystem/api/readDirectory';
import type { FsEntryMetadata } from '@protocol7/filesystem-types';

const nameCompareFn = keyToCompareFn<FsEntryMetadata>(({ name }) => [name]);
const modifiedCompareFn = keyToCompareFn<FsEntryMetadata>(({ modified }) => [modified]);
const sizeCompareFn = keyToCompareFn<FsEntryMetadata>((metadata) => [metadata.type === 'file' ? metadata.size : 0]);

// mapping columns and the comparison functions they use for ordering entries
const FILE_TABLE_COLUMNS = {
    ['Name']: { compareFn: nameCompareFn },
    ['Last modified']: { compareFn: modifiedCompareFn },
    ['Size']: { compareFn: sizeCompareFn },
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
                <div className={cn('absolute left-[50%] -mt-2', isAscending ? 'rotate-90' : '-rotate-90')}>
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
    locations?: SavedLocations;
    isSelected: boolean;
    onClick: (event: MouseEvent) => void;

    wid: number;
}

const FileTableRow = ({ metadata, setCwd, locations, isSelected, onClick, wid }: FileTableRowProps) => {
    const { type, name, path, modified, uid } = metadata;
    const isDirectory = type === 'directory';

    const [icon] = usePromise(async () => {
        // if this entry is a favorite location, use the icon for that instead
        const location = locations?.get(path);
        if (location) return { objectURL: getSystemIcon(location.icon), isSystemIcon: true };

        return await getIconForEntry(path);
    }, [locations, path]);

    const tooltipLabel = formatMetadataTooltip(metadata);

    return (
        <Tooltip
            label={tooltipLabel}
            className="col-span-4 grid grid-cols-subgrid"
            id={`drag-select-container-file-manager-${wid}-table-item-${uid}`}
        >
            <div
                onClick={onClick}
                {...(isDirectory && { onDoubleClick: () => setCwd(path) })}
                className={cn(
                    `
                        col-span-4 grid grid-cols-subgrid rounded-xs bg-linear-to-b inset-ring-gray-100
                        outline-aero-tint-highlight
                        *:my-auto
                        hover:to-aero-tint-highlight/50 hover:inset-ring hover:outline
                    `,
                    isSelected && 'to-aero-tint-highlight/50 inset-ring outline',
                )}
            >
                {/* display a shadow under custom image icons to ensure visibility */}
                <div className={cn('px-1', icon?.isSystemIcon || 'drop-shadow-xs drop-shadow-aero-tint-dark')}>
                    {icon && <img src={icon.objectURL} alt={name} width={16} />}
                </div>
                <div className="overflow-hidden py-0.5 pr-4 text-nowrap text-ellipsis">{name}</div>
                <div>{formatTimestampShort(modified)}</div>
                <div>{isDirectory || formatSizeBytes(metadata.size)}</div>
            </div>
        </Tooltip>
    );
};

const PlaceholderRow = ({ children }: PropsWithChildren) => (
    <div className="col-span-4 mx-auto p-10 text-xs text-aero-tint/50">{children}</div>
);

export interface FileTableProps {
    setCwd: (dir: string) => void;
    dir?: ReadDirectoryResult;
    locations?: SavedLocations;

    wid: number;
}

export const FileTable = ({ setCwd, dir, locations, wid }: FileTableProps) => {
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

    const sortedEntries = [...(directories ?? []), ...(files ?? [])];
    const entryUids = sortedEntries.map(({ uid }) => uid);

    // entry selection states
    const [entryStates, updateEntries] = useDragSelectReducer<number>();

    const [prevEntryUids, setPrevEntryUids] = useState(entryUids);
    if (!shallowArrayEquals(entryUids, prevEntryUids)) {
        setPrevEntryUids(entryUids);

        const newStates = new Map([...directories!, ...files!].map(({ uid }) => [uid, false]));
        updateEntries({ action: 'replace', newStates });
    }

    return (
        <div
            onScroll={({ currentTarget }) => setIsScrolled(currentTarget.scrollTop > 0)}
            className="
                mt-2 mr-2 w-full overflow-y-scroll overscroll-none rounded-lg border
                border-x-aero-tint-dark/35 border-t-aero-tint-dark/30 border-b-aero-tint-dark/40 bg-white
                text-aero-tint-darkest outline outline-white/50 contain-layout text-shadow-none
            "
        >
            <DragSelectContainer
                itemStates={entryStates}
                updateItems={updateEntries}
                renderItem={(key, isSelected, onClick) => (
                    <FileTableRow
                        key={key}
                        setCwd={setCwd}
                        metadata={entries!.find(({ uid }) => uid === key)!}
                        locations={locations}
                        isSelected={isSelected}
                        onClick={onClick}
                        wid={wid}
                    />
                )}
                // contain-paint here prevents the `DragSelectContainer`'s rect from making scrollbars appear while
                // still allowing actual overflowing content to scroll
                className="
                    grid min-h-full grid-cols-[1.5rem_9fr_6fr_4fr] content-start p-2 text-left text-xs
                    contain-paint
                "
                {...(hasEntries && { portalItemsToId: `file-manager-${wid}-items-portal` })}
                uniqueId={`file-manager-${wid}-table`}
            >
                {/* fades out the top of the list when scrolled to keep the column headers visible */}
                {isScrolled && (
                    <div
                        className="
                            sticky top-0 z-10 col-span-4 -mx-3 -mt-10 h-10 bg-linear-to-b from-white from-60%
                            to-transparent
                        "
                    />
                )}

                <div className="sticky top-2 z-20 col-span-4 grid grid-cols-subgrid">
                    {/* icon column header */}
                    <div className="w-6 max-w-6 min-w-6" />
                    {Object.keys(FILE_TABLE_COLUMNS).map((column) => (
                        <FileTableColumnHeader
                            key={column}
                            isAscending={isAscending}
                            currentSortColumn={sortColumn}
                            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
                            thisSortColumn={column as FileTableColumnName}
                            setIsAscending={setIsAscending}
                            setSortColumn={setSortColumn}
                        >
                            {column}
                        </FileTableColumnHeader>
                    ))}
                    <div className="h-1" />
                </div>

                {isDirLoading ? (
                    <PlaceholderRow>Loading...</PlaceholderRow>
                ) : (
                    !hasEntries && <PlaceholderRow>No items</PlaceholderRow>
                )}

                {/* the actual file table gets portalled here */}
                <div
                    className="col-span-4 grid grid-cols-subgrid content-start gap-px"
                    id={`file-manager-${wid}-items-portal`}
                />
            </DragSelectContainer>
        </div>
    );
};
