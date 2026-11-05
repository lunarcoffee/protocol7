import { cn } from 'cn';
import { type MouseEvent, type PropsWithChildren, useState } from 'react';

import { ContextMenu } from '../controls/ContextMenu';
import { DragSelectContainer } from '../controls/DragSelectContainer';
import { IconDragSelectContainer } from '../controls/iconDragSelectContainer/IconDragSelectContainer';
import { Tooltip } from '../controls/Tooltip';
import { rightCaretIcon } from './Breadcrumbs';
import { HeadingText } from './HeadingText';
import { useFileManagerStore } from './store/useFileManagerStore';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { usePromise } from '@/hooks/usePromise';
import { FILE_TABLE_COLUMNS, type FileTableColumnName } from '@/stores/fileManager/store';
import { formatMetadataTooltip } from '@/utils/formatMetadataTooltip';
import { formatSizeBytes } from '@/utils/formatSizeBytes';
import { formatTimestampShort } from '@/utils/formatTimestamp';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { ListMenuItem } from '../controls/ListMenu';
import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';
import type { FsEntryMetadata } from '@protocol7/filesystem-types';

interface FileTableColumnHeaderProps extends PropsWithChildren {
    thisSortColumn: FileTableColumnName;
}

const FileTableColumnHeader = ({ thisSortColumn, children }: FileTableColumnHeaderProps) => {
    const currentSortColumn = useFileManagerStore(({ settings }) => settings.sortColumn);
    const isAscending = useFileManagerStore(({ settings }) => settings.isAscending);
    const updateSettings = useFileManagerStore(({ updateSettings }) => updateSettings);

    const currentlySortingByThisColumn = currentSortColumn === thisSortColumn;

    const updateSortSettings = () => {
        // toggle direction if this column is currently selected; otherwise, always set to ascending
        if (currentlySortingByThisColumn) void updateSettings({ isAscending: !isAscending });
        else void updateSettings({ sortColumn: thisSortColumn, isAscending: true });
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

// if the given entry is a saved location, use the icon for that instead
const useGetIconWithLocations = () => {
    const locations = useFileManagerStore(({ settings }) => settings.locations);

    return async (entryPath: string) => {
        const location = locations.get(entryPath);
        if (location) return { objectURL: getSystemIcon(location.icon), isSystemIcon: true };

        return await getIconForEntry(entryPath);
    };
};

interface FileTableRowProps {
    metadata: FsEntryMetadata;
    isSelected: boolean;
    onClick: (event: MouseEvent) => void;

    wid: number;
}

const FileTableRow = ({ metadata, isSelected, onClick, wid }: FileTableRowProps) => {
    const setCwd = useFileManagerStore(({ setCwd }) => setCwd);
    const searchQuery = useFileManagerStore(({ searchQuery }) => searchQuery);
    const setSearchQuery = useFileManagerStore(({ setSearchQuery }) => setSearchQuery);

    const { type, name, path, modified, uid } = metadata;
    const isDirectory = type === 'directory';

    const getIconWithLocations = useGetIconWithLocations();
    const [icon] = usePromise(() => getIconWithLocations(path), [path, getIconWithLocations]);

    const tooltipLabel = formatMetadataTooltip(metadata, !!searchQuery);

    return (
        <Tooltip
            label={tooltipLabel}
            className="col-span-4 grid grid-cols-subgrid"
            id={`drag-select-container-file-manager-${wid}-table-item-${uid}`}
        >
            <div
                onClick={onClick}
                {...(isDirectory && {
                    onDoubleClick: () => {
                        // if the user clicks on a directory in the search results, assume they're done searching
                        if (searchQuery) setSearchQuery('');
                        void setCwd(path);
                    },
                })}
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
                    {icon && <img src={icon.objectURL} width={16} />}
                </div>
                <div className="overflow-hidden py-0.5 pr-4 text-nowrap text-ellipsis">{name}</div>
                <div>{formatTimestampShort(modified)}</div>
                <div>{isDirectory || formatSizeBytes(metadata.size)}</div>
            </div>
        </Tooltip>
    );
};

const PlaceholderText = ({ children }: PropsWithChildren) => (
    <div className="pointer-events-none col-span-4 mx-auto p-10 text-xs text-aero-tint/50">{children}</div>
);

const FileDisplayPanePlaceholder = () => {
    const cwdEntries = useFileManagerStore(({ cwdEntries }) => cwdEntries);
    const searchQuery = useFileManagerStore(({ searchQuery }) => searchQuery);
    const isDoneSearching = useFileManagerStore(({ isDoneSearching }) => isDoneSearching);

    const hasEntries = cwdEntries && cwdEntries.length > 0;

    return !cwdEntries ? (
        <PlaceholderText>Loading...</PlaceholderText>
    ) : (
        !hasEntries && (
            <PlaceholderText>{searchQuery && !isDoneSearching ? 'Searching...' : 'No items'}</PlaceholderText>
        )
    );
};

interface FileTableProps extends PropsWithWindowInfo {
    isScrolled: boolean;
}

const FileTable = ({ winfo, isScrolled }: FileTableProps) => {
    const { wid } = winfo;

    const cwdEntries = useFileManagerStore(({ cwdEntries }) => cwdEntries);
    const selectionStates = useFileManagerStore(({ selectionStates }) => selectionStates);
    const updateSelection = useFileManagerStore(({ updateSelection }) => updateSelection);

    const entries = cwdEntries ?? null;
    const hasEntries = cwdEntries && entries!.length > 0;

    return (
        <DragSelectContainer
            itemStates={selectionStates}
            updateItems={updateSelection}
            renderItem={(key, isSelected, onClick) => (
                <FileTableRow
                    key={key}
                    metadata={entries!.find(({ uid }) => uid === key)!}
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
                        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
                        thisSortColumn={column as FileTableColumnName}
                    >
                        {column}
                    </FileTableColumnHeader>
                ))}

                <div className="h-1" />
            </div>

            <FileDisplayPanePlaceholder />

            {/* the actual file table gets portalled here */}
            <div
                className="col-span-4 grid grid-cols-subgrid content-start gap-px"
                id={`file-manager-${wid}-items-portal`}
            />
        </DragSelectContainer>
    );
};

const FileGrid = ({ winfo }: PropsWithWindowInfo) => {
    const { wid } = winfo;

    const setCwd = useFileManagerStore(({ setCwd }) => setCwd);
    const cwdEntries = useFileManagerStore(({ cwdEntries }) => cwdEntries);
    const selectionStates = useFileManagerStore(({ selectionStates }) => selectionStates);
    const updateSelection = useFileManagerStore(({ updateSelection }) => updateSelection);

    const searchQuery = useFileManagerStore(({ searchQuery }) => searchQuery);
    const setSearchQuery = useFileManagerStore(({ setSearchQuery }) => setSearchQuery);

    const getIconWithLocations = useGetIconWithLocations();

    const entries = cwdEntries ?? null;
    const hasEntries = cwdEntries && entries!.length > 0;

    return (
        <IconDragSelectContainer
            itemStates={selectionStates}
            updateItems={updateSelection}
            {...(hasEntries && { portalItemsToId: `file-manager-${wid}-items-portal` })}
            stateToIconProps={(key) => {
                const metadata = entries!.find(({ uid }) => uid === key)!;
                return {
                    getIcon: () => getIconWithLocations(metadata.path),
                    label: metadata.name,
                    tooltip: formatMetadataTooltip(metadata, !!searchQuery),
                    onClick:
                        metadata.type === 'directory'
                            ? async () => {
                                  if (searchQuery) setSearchQuery('');
                                  void setCwd(metadata.path);
                              }
                            : async () => {},
                };
            }}
            deselectOnBlur
            winfo={winfo}
        >
            <FileDisplayPanePlaceholder />

            {/* the actual file icon grid gets portalled here */}
            <div
                className="pointer-events-none flex flex-row flex-wrap content-start gap-2 p-1 pb-4"
                id={`file-manager-${wid}-items-portal`}
            />
        </IconDragSelectContainer>
    );
};

export const FileDisplayPane = (props: PropsWithWindowInfo) => {
    const refresh = useFileManagerStore(({ refresh }) => refresh);

    const displayMode = useFileManagerStore(({ settings }) => settings.displayMode);
    const sortColumn = useFileManagerStore(({ settings }) => settings.sortColumn);
    const isAscending = useFileManagerStore(({ settings }) => settings.isAscending);
    const updateSettings = useFileManagerStore(({ updateSettings }) => updateSettings);

    const [isScrolled, setIsScrolled] = useState(false);

    const checkIconProps = { icon: <CheckIcon width={14} /> };
    const contextMenuItems: ListMenuItem[] = [
        {
            type: 'submenu',
            label: 'View...',
            icon: 'actions/view-preview.png',
            subItems: [
                {
                    type: 'button',
                    label: 'as list',
                    ...(displayMode === 'list' && checkIconProps),
                    onClick: () => void updateSettings({ displayMode: 'list' }),
                },
                {
                    type: 'button',
                    label: 'as icons',
                    ...(displayMode === 'grid' && checkIconProps),
                    onClick: () => void updateSettings({ displayMode: 'grid' }),
                },
            ],
        },
        {
            type: 'submenu',
            label: 'Sort...',
            icon: 'actions/view-filter.png',
            subItems: [
                {
                    type: 'button',
                    label: 'by name',
                    ...(sortColumn === 'Name' && checkIconProps),
                    onClick: () => void updateSettings({ sortColumn: 'Name' }),
                },
                {
                    type: 'button',
                    label: 'by last modified',
                    ...(sortColumn === 'Last modified' && checkIconProps),
                    onClick: () => void updateSettings({ sortColumn: 'Last modified' }),
                },
                {
                    type: 'button',
                    label: 'by size',
                    ...(sortColumn === 'Size' && checkIconProps),
                    onClick: () => void updateSettings({ sortColumn: 'Size' }),
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'in ascending order',
                    ...(isAscending && checkIconProps),
                    onClick: () => void updateSettings({ isAscending: true }),
                },
                {
                    type: 'button',
                    label: 'in descending order',
                    ...(!isAscending && checkIconProps),
                    onClick: () => void updateSettings({ isAscending: false }),
                },
            ],
        },
        { type: 'button', label: 'Refresh', onClick: () => void refresh() },
    ];

    return (
        <div
            onScroll={({ currentTarget }) => setIsScrolled(currentTarget.scrollTop > 0)}
            className="
                mt-2 mr-2 w-full overflow-y-scroll overscroll-none rounded-lg border
                border-x-aero-tint-dark/35 border-t-aero-tint-dark/30 border-b-aero-tint-dark/40 bg-white
                text-aero-tint-darkest outline outline-white/50 contain-layout text-shadow-none
            "
        >
            <ContextMenu items={contextMenuItems} className="size-full">
                {displayMode === 'list' ? (
                    <FileTable {...props} isScrolled={isScrolled} />
                ) : (
                    displayMode === 'grid' && <FileGrid {...props} />
                )}
            </ContextMenu>
        </div>
    );
};
