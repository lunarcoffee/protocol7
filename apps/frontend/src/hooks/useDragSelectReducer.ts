import { type Draft, castDraft } from 'immer';
import { useImmerReducer } from 'use-immer';

import type {
    DragSelectItemKey,
    ItemStates,
    UpdateItemStatesAction,
} from '@/components/shell/controls/DragSelectContainer';

// use with `DragSelectContainer`
const itemStateReducer = <K extends DragSelectItemKey>(
    draft: Draft<ItemStates<K>>,
    actionRaw: UpdateItemStatesAction<K>,
) => {
    const action = actionRaw;
    switch (action.action) {
        case 'set':
            draft.set(castDraft(action.key), action.value);
            break;
        case 'set-all':
            draft.forEach((_, key) => draft.set(key, action.value));
            break;
        case 'toggle':
            draft.set(castDraft(action.key), !draft.get(castDraft(action.key)));
            break;
        case 'replace':
            return action.newStates;
    }
    return undefined;
};

export const useDragSelectReducer = <K extends DragSelectItemKey>() =>
    useImmerReducer<ItemStates<K>, UpdateItemStatesAction<K>>(itemStateReducer, new Map() as ItemStates<K>);
