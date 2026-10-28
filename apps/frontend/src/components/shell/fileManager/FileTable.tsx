import { cn } from 'cn';
import { type MouseEvent, type PropsWithChildren, useState } from 'react';

import { DragSelectContainer } from '../controls/DragSelectContainer';
import { Tooltip } from '../controls/Tooltip';
import { rightCaretIcon } from './Breadcrumbs';
import { HeadingText } from './HeadingText';
import { useFileManagerStore } from './store/useFileManagerStore';
import { usePromise } from '@/hooks/usePromise';
import { FILE_TABLE_COLUMNS, type FileTableColumnName } from '@/stores/fileManager/store';
import { formatMetadataTooltip } from '@/utils/formatMetadataTooltip';
import { formatSizeBytes } from '@/utils/formatSizeBytes';
import { formatTimestampShort } from '@/utils/formatTimestamp';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';

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

interface FileTableRowProps {
    metadata: FsEntryMetadata;
    isSelected: boolean;
    onClick: (event: MouseEvent) => void;

    wid: number;
}

const FileTableRow = ({ metadata, isSelected, onClick, wid }: FileTableRowProps) => {
    const setCwd = useFileManagerStore(({ setCwd }) => setCwd);
    const locations = useFileManagerStore(({ settings }) => settings.locations);

    const { type, name, path, modified, uid } = metadata;
    const isDirectory = type === 'directory';

    const [icon] = usePromise(async () => {
        // if this entry is a favorite location, use the icon for that instead
        const location = locations.get(path);
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
                {...(isDirectory && { onDoubleClick: () => void setCwd(path) })}
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

const PlaceholderRow = ({ children }: PropsWithChildren) => (
    <div className="col-span-4 mx-auto p-10 text-xs text-aero-tint/50">{children}</div>
);

export const FileTable = ({ winfo }: PropsWithWindowInfo) => {
    const { wid } = winfo;

    const dir = useFileManagerStore(({ dir }) => dir);
    const selectionStates = useFileManagerStore(({ selectionStates }) => selectionStates);
    const updateSelection = useFileManagerStore(({ updateSelection }) => updateSelection);

    const [isScrolled, setIsScrolled] = useState(false);

    const isDirLoading = !dir?.ok;
    const entries = isDirLoading ? null : Object.values(dir.entries);
    const hasEntries = !isDirLoading && entries!.length > 0;

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
