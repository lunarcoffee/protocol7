import { useReducer } from 'react';

import type {
    DragSelectItemKey,
    ItemStates,
    UpdateItemStatesAction,
} from '@/components/shell/controls/DragSelectContainer';

export const reduceItemStates = <K extends DragSelectItemKey>(
    states: ItemStates<K>,
    action: UpdateItemStatesAction<K>,
): ItemStates<K> => {
    const nextStates = new Map(states);

    switch (action.action) {
        case 'set':
            nextStates.set(action.key, action.value);
            break;
        case 'set-all':
            states.forEach((_, key) => nextStates.set(key, action.value));
            break;
        case 'toggle':
            nextStates.set(action.key, !states.get(action.key));
            break;
        case 'replace':
            return action.newStates;
    }

    return nextStates;
};

export const useDragSelectReducer = <K extends DragSelectItemKey>() =>
    useReducer(reduceItemStates, new Map<K, boolean>());
