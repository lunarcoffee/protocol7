import { getShellRootElement } from './getShellRootElement';

import type { Dimensions } from './Dimensions';

export interface HandleMouseDragArgs {
    initialPosition: Dimensions;

    onMove: (dx: number, dy: number, event: MouseEvent) => void;
    onDragEnd?: () => void;

    // cursor style to apply for the duration of the gesture
    cursor?: string;
}

// useful in mouseDown handlers where you want to track the associated drag movement that comes after - see
// `WindowFrame` or `ResizeHandles` for examples
export const handleMouseDrag = ({ initialPosition: { x, y }, onMove, onDragEnd, cursor }: HandleMouseDragArgs) => {
    const shellRoot = getShellRootElement()!;

    if (cursor) shellRoot.style.cursor = cursor;

    const mouseMoveListener = (event: MouseEvent) => {
        const dx = event.clientX - x;
        const dy = event.clientY - y;

        onMove(dx, dy, event);
    };

    const mouseUpListener = () => {
        shellRoot.removeEventListener('mousemove', mouseMoveListener);
        shellRoot.removeEventListener('mouseleave', mouseUpListener);
        shellRoot.removeEventListener('mouseup', mouseUpListener);

        if (cursor) shellRoot.style.cursor = 'unset';

        onDragEnd?.();
    };

    shellRoot.addEventListener('mousemove', mouseMoveListener);
    shellRoot.addEventListener('mouseleave', mouseUpListener);
    shellRoot.addEventListener('mouseup', mouseUpListener);
};
