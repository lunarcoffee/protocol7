import { cn } from 'cn';
import { type PropsWithChildren, useEffect, useId } from 'react';

import { DragSelectContainer, type DragSelectContainerProps, type DragSelectItemKey } from '../DragSelectContainer';
import { DragSelectableIcon, type DragSelectableIconUserProps } from './DragSelectableIcon';

import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

export type IconDragSelectContainerProps<K extends DragSelectItemKey> = Pick<
    DragSelectContainerProps<K>,
    'itemStates' | 'updateItems' | 'portalItemsToId'
> &
    PropsWithWindowInfo &
    PropsWithChildren & {
        stateToIconProps: (key: K) => DragSelectableIconUserProps;
        deselectOnBlur?: boolean;
    };

export const IconDragSelectContainer = <K extends DragSelectItemKey>({
    updateItems,
    stateToIconProps,
    deselectOnBlur = false,
    winfo: { hasFocus },
    children,
    portalItemsToId,
    ...props
}: IconDragSelectContainerProps<K>) => {
    const containerUid = useId();

    // deselect icons when the containing window loses focus
    useEffect(() => {
        if (deselectOnBlur && !hasFocus) updateItems({ action: 'set-all', value: false });
    }, [deselectOnBlur, hasFocus, updateItems]);

    return (
        <DragSelectContainer
            updateItems={updateItems}
            renderItem={(key, isSelected, onClick) => {
                return (
                    <DragSelectableIcon
                        key={key.toString()}
                        {...stateToIconProps(key)}
                        isSelected={isSelected}
                        onSelect={onClick}
                        containerUid={containerUid}
                        iconKey={key.toString()}
                    />
                );
            }}
            className={cn('min-h-full p-1 contain-paint', portalItemsToId || 'flex flex-row flex-wrap gap-2')}
            uniqueId={containerUid}
            portalItemsToId={portalItemsToId}
            {...props}
        >
            {children}
        </DragSelectContainer>
    );
};
