import { cn } from 'cn';

import { Tooltip } from '@/components/shell/controls/Tooltip';
import { usePromise } from '@/hooks/usePromise';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { MouseEvent } from 'react';

export interface DragSelectableIconUserProps {
    // allow a system icon or an entry to take an icon from
    icon?: string; // TODO: consider global SystemIcon = string alias for clarity
    iconEntryPath?: string;
    label: string;
    tooltip: string; // TODO: optional
    // TODO: context menu items
    onClick: () => Promise<void>;
}

export type DragSelectableIconProps = DragSelectableIconUserProps & {
    isSelected: boolean;
    onSelect: (event: MouseEvent) => void;

    containerUid: string;
    iconKey: string;
};

// for use as children of `DragSelectContainer`
export const DragSelectableIcon = ({
    icon,
    iconEntryPath,
    label,
    tooltip,
    onClick,
    isSelected,
    onSelect,
    containerUid,
    iconKey,
}: DragSelectableIconProps) => {
    const [iconImage] = usePromise(
        async () => (iconEntryPath ? await getIconForEntry(iconEntryPath) : getSystemIcon(icon!)),
        [iconEntryPath, icon],
    );

    // TODO: factor out icon display component?
    return (
        <Tooltip label={tooltip} className="h-fit">
            <div
                id={`drag-select-container-${containerUid}-item-${iconKey}`}
                className={cn(
                    `
                        flex w-20 flex-col items-center gap-1.5 overflow-visible rounded-xs pt-1
                        hover:bg-aero-tint-highlight/25 hover:shadow-[0_0_4px]
                        hover:shadow-aero-tint-highlight/25 hover:outline hover:outline-aero-tint-highlight/25
                    `,
                    isSelected &&
                        `
                            bg-aero-tint-highlight/45 shadow-[0_0_4px] shadow-aero-tint-highlight/45 outline
                            outline-aero-tint-highlight/45
                            hover:bg-aero-tint-highlight/55 hover:shadow-aero-tint-highlight/55 hover:outline
                            hover:outline-aero-tint-highlight/55
                        `,
                )}
                onMouseDown={onSelect}
                onDoubleClick={onClick}
            >
                <div
                    className="
                        flex size-15 items-center justify-center drop-shadow-sm
                        drop-shadow-aero-tint-darkest/70
                    "
                >
                    {iconImage && (
                        <img src={typeof iconImage === 'string' ? iconImage : iconImage.objectURL} draggable={false} />
                    )}
                </div>
                <div className="flex w-20 justify-center overflow-visible">
                    <p
                        className={cn(
                            `
                                px-0.5 pb-0.5 text-center text-xs wrap-break-word
                                text-shadow-aero-tint-darkest text-shadow-md
                            `,
                            isSelected ? 'line-clamp-4' : 'line-clamp-2',
                        )}
                    >
                        {label}
                    </p>
                </div>
            </div>
        </Tooltip>
    );
};
