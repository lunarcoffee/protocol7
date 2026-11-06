import { cn } from 'cn';
import { type MouseEvent } from 'react';

import { ContextMenu } from '../ContextMenu';
import { Tooltip } from '../Tooltip';
import { usePromise } from '@/hooks/usePromise';
import { type GetIconForEntryResult } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { ListMenuItem } from '../ListMenu';

export interface DragSelectableIconUserProps {
    getIcon: () => Promise<string | GetIconForEntryResult>; // TODO: consider global SystemIcon = string alias for clarity
    label: string;
    tooltip?: string;
    iconShadow?: 'non-system' | 'always';
    contextMenuItems?: ListMenuItem[];
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
    getIcon,
    label,
    tooltip,
    iconShadow = 'non-system',
    contextMenuItems,
    onClick,
    isSelected,
    onSelect,
    containerUid,
    iconKey,
}: DragSelectableIconProps) => {
    const [icon] = usePromise(() => getIcon(), [getIcon]);

    const isSystemIcon = typeof icon === 'string' || icon?.isSystemIcon;
    const iconUrl = typeof icon === 'string' ? getSystemIcon(icon) : icon?.objectURL;

    return (
        <ContextMenu items={contextMenuItems}>
            {/* make selected icons appear over the others to improve long name visibility */}
            <Tooltip label={tooltip} className={cn('h-30', isSelected && 'z-10')}>
                <div
                    id={`drag-select-container-${containerUid}-item-${iconKey}`}
                    className={cn(
                        `
                            pointer-events-auto flex w-20 flex-col items-center gap-1.5 overflow-visible
                            rounded-xs pt-1
                            hover:bg-aero-tint-highlight/25 hover:shadow-[0_0_4px]
                            hover:shadow-aero-tint-highlight/25 hover:outline
                            hover:outline-aero-tint-highlight/25
                        `,
                        isSelected &&
                            `
                                bg-aero-tint-highlight/45 shadow-[0_0_4px] shadow-aero-tint-highlight/45
                                outline outline-aero-tint-highlight/45
                                hover:bg-aero-tint-highlight/55 hover:shadow-aero-tint-highlight/55
                                hover:outline hover:outline-aero-tint-highlight/55
                            `,
                    )}
                    onMouseDown={onSelect}
                    onDoubleClick={onClick}
                >
                    <div
                        className={cn(
                            'flex size-15 items-center justify-center',
                            (!isSystemIcon || iconShadow === 'always') &&
                                'drop-shadow-sm drop-shadow-aero-tint-darkest/70',
                        )}
                    >
                        {iconUrl && <img src={iconUrl} draggable={false} />}
                    </div>
                    <div className="flex w-20 justify-center overflow-visible">
                        <p
                            className={cn(
                                `px-0.5 pb-0.5 text-center text-xs wrap-break-word`,
                                isSelected ? 'line-clamp-4' : 'line-clamp-2',
                            )}
                        >
                            {label}
                        </p>
                    </div>
                </div>
            </Tooltip>
        </ContextMenu>
    );
};
