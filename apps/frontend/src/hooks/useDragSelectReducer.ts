import { useImmerReducer } from 'use-immer';

import type { ItemStates, UpdateItemStatesAction } from '@/components/shell/controls/DragSelectContainer';
import type { Draft } from 'immer';

// use with `DragSelectContainer`
const itemStateReducer = <K>(draft: Draft<ItemStates<K>>, actionRaw: UpdateItemStatesAction<K>) => {
    const action = actionRaw;
    switch (action.action) {
        case 'set': {
            const { key, value } = action;
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            draft.set(key as Draft<K>, value);
            break;
        }
        case 'set-all': {
            const { value } = action;
            draft.forEach((_, key) => draft.set(key, value));
            break;
        }
        case 'toggle': {
            const { key } = action;
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            draft.set(key as Draft<K>, !draft.get(key as Draft<K>));
            break;
        }
        case 'replace': {
            return action.newStates;
        }
    }
    return undefined;
};

export const useDragSelectReducer = <K>() =>
    useImmerReducer<ItemStates<K>, UpdateItemStatesAction<K>>(itemStateReducer, new Map() as ItemStates<K>);
