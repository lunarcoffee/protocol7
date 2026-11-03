import { useEffect, useId, useState } from 'react';

import { DragSelectContainer, type DragSelectItemKey } from '../DragSelectContainer';
import { DragSelectableIcon, type DragSelectableIconUserProps } from './DragSelectableIcon';
import { useDragSelectReducer } from '@/hooks/useDragSelectReducer';
import { shallowArrayEquals } from '@/utils/shallowArrayEquals';

import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

export interface IconDragSelectContainerProps<T, K extends DragSelectItemKey> extends PropsWithWindowInfo {
    items: T[];
    itemToKey: (item: T) => K;
    itemToIconProps: (item: T) => DragSelectableIconUserProps;

    deselectOnBlur?: boolean;
}

export const IconDragSelectContainer = <T, K extends DragSelectItemKey>({
    items,
    itemToKey,
    itemToIconProps,
    deselectOnBlur = false,
    winfo: { hasFocus },
}: IconDragSelectContainerProps<T, K>) => {
    const containerUid = useId();

    const [itemStates, updateItems] = useDragSelectReducer<K>();

    const [prevItems, setPrevItems] = useState(items);
    if (!shallowArrayEquals(items, prevItems)) {
        setPrevItems(items);

        // items changed, reset icons to default state
        const newStates = new Map([...items].map((item) => [itemToKey(item), false]));
        updateItems({ action: 'replace', newStates });
    }

    // deselect icons when the containing window loses focus
    useEffect(() => {
        if (deselectOnBlur && !hasFocus) updateItems({ action: 'set-all', value: false });
    }, [deselectOnBlur, hasFocus, updateItems]);

    return (
        <DragSelectContainer
            itemStates={itemStates}
            updateItems={updateItems}
            renderItem={(key, isSelected, onClick) => {
                const item = items.find((item) => itemToKey(item) === key)!;
                return (
                    <DragSelectableIcon
                        key={key.toString()}
                        {...itemToIconProps(item)}
                        isSelected={isSelected}
                        onSelect={onClick}
                        containerUid={containerUid}
                        iconKey={key.toString()}
                    />
                );
            }}
            className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
            uniqueId={containerUid}
        />
    );
};
