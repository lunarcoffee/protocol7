import { cn } from 'cn';
import { type Dispatch, type JSX, type MouseEvent, type PropsWithChildren, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { doRectanglesIntersect } from '@/utils/doRectanglesIntersect';
import { handleMouseDrag } from '@/utils/handleMouseDrag';
import { platformModifierKeys } from '@/utils/platformModifierKeys';

import type { Dimensions } from '@/utils/Dimensions';

// so that we can interpolate values of type `K` in template literals
export interface DragSelectItemKey {
    toString(): string;
}

// selected states for each item key
export type ItemStates<K extends DragSelectItemKey> = Map<K, boolean>;

export type UpdateItemStatesAction<K extends DragSelectItemKey> =
    | { action: 'set'; key: K; value: boolean }
    | { action: 'set-all'; value: boolean }
    | { action: 'toggle'; key: K }
    | { action: 'replace'; newStates: ItemStates<K> };

export interface DragSelectContainerProps<K extends DragSelectItemKey> extends PropsWithChildren {
    itemStates: ItemStates<K>;
    updateItems: Dispatch<UpdateItemStatesAction<K>>;
    renderItem: (key: K, isSelected: boolean, onClick: (event: MouseEvent) => void) => JSX.Element;

    className?: string;

    // the intended purpose of this is to allow the drag container to sit higher up in the DOM than its items so the
    // draggable area isn't restricted to the items' direct ancestor
    portalItemsToId?: string;

    // TODO: with window/app context we can handle this automatically (unless we have multiple containers in a window)
    // used in the IDs for items (which must be globally unique)
    uniqueId: string;
}

export const DragSelectContainer = <K extends DragSelectItemKey>({
    itemStates,
    updateItems,
    renderItem,
    className,
    portalItemsToId,
    uniqueId,
    children,
}: DragSelectContainerProps<K>) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDragging, startDrag, endDrag] = useBoolean(false);
    const [dragRect, setDragRect] = useState({});

    const onContainerDragStart = (initialPosition: Dimensions) => {
        if (!containerRef.current) return;

        const { top, left } = containerRef.current.getBoundingClientRect();
        const { x, y } = { x: initialPosition.x - left, y: initialPosition.y - top };

        handleMouseDrag({
            initialPosition,
            onMove: (dx, dy) => {
                setDragRect({
                    top: dy < 0 ? y + dy : y,
                    left: dx < 0 ? x + dx : x,
                    width: Math.abs(dx),
                    height: Math.abs(dy),
                });

                // we only call this after the cursor moves so we don't draw a rectangle if the user ends up only
                // clicking instead of dragging
                startDrag();

                const dragRectElement = document.getElementById('drag-select-container-drag-rect');
                if (!dragRectElement) return;

                // select all items which intersect the drag rectangle and deselect all others
                itemStates.forEach((_, key) => {
                    const itemElement = document.getElementById(
                        `drag-select-container-${uniqueId}-item-${key.toString()}`,
                    );
                    if (itemElement) {
                        const dragRect = dragRectElement.getBoundingClientRect();
                        const itemRect = itemElement.getBoundingClientRect();
                        updateItems({ action: 'set', key, value: doRectanglesIntersect(dragRect, itemRect) });
                    }
                });
            },
            onDragEnd: endDrag,
        });
    };

    const onClickItem = (key: K) => (event: MouseEvent) => {
        // clicking an item in multi-select mode toggles the selection state; otherwise, it is always set to true
        const isMultiSelect = event.getModifierState(platformModifierKeys.MULTI_SELECT);
        if (!isMultiSelect) {
            updateItems({ action: 'set-all', value: false });
            updateItems({ action: 'set', key, value: true });
        } else {
            updateItems({ action: 'toggle', key });
        }
    };

    const items = Array.from(itemStates.entries(), ([key, isSelected]) =>
        renderItem(key, isSelected, onClickItem(key)),
    );

    return (
        <div
            ref={containerRef}
            onMouseDown={(event) => {
                // clicks directly on the container should always deselect items and prepare for dragging
                if (event.target === event.currentTarget && event.button === 0) {
                    updateItems({ action: 'set-all', value: false });
                    onContainerDragStart({ x: event.clientX, y: event.clientY });
                }
            }}
            className={cn('relative', className)}
        >
            {children}
            {portalItemsToId ? createPortal(items, document.getElementById(portalItemsToId)!) : items}
            {isDragging && (
                <div
                    id="drag-select-container-drag-rect"
                    className="
                        pointer-events-none absolute border border-aero-tint-highlight/25
                        bg-aero-tint-highlight/20
                    "
                    style={dragRect}
                />
            )}
        </div>
    );
};
