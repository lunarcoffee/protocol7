import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { Dimensions } from '@/utils/Dimensions';
import { getMousePosition } from '@/utils/getMousePosition';
import { getShellRootElement } from '@/utils/getShellRootElement';
import { toScreenPosition } from '@/utils/toScreenPosition';

// TODO: maybe implement custom cursors so this isn't a guessing game
const CURSOR_HEIGHT = 20;
const CURSOR_PADDING = 8;

export interface PositionAnchorProps extends PropsWithChildren {
    // position in client coordinates; defaults to the cursor position at the time of first render
    position?: Dimensions;

    // whether to nudge the contents out of the way of the cursor
    offsetForCursor?: boolean;

    className?: string;
}

// anchors `children` to the bottom right of the given `position`, adjusting as necessary to keep the entire contents
// visible on the screen without clipping
export const PositionAnchor = ({ position, offsetForCursor, className, children }: PositionAnchorProps) => {
    // initial desired anchor position
    let { x, y } = position ?? getMousePosition();
    if (offsetForCursor) {
        x += CURSOR_PADDING;
        y += CURSOR_HEIGHT;
    }
    const { x: sx, y: sy } = toScreenPosition({ x, y });

    // actual anchor position; this might be updated in the effect below
    const [left, setLeft] = useState(sx);
    const [top, setTop] = useState(sy);

    // prevents flickering; we only render once this is set and we only set this once the above state is finalized
    const [canDisplay, setCanDisplay, setCannotDisplay] = useBoolean();

    const fakeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCannotDisplay();
        setLeft(sx);
        setTop(sy);

        if (!fakeRef.current) return;

        const { right, bottom } = getShellRootElement()!.getBoundingClientRect();
        const { width, height } = fakeRef.current.getBoundingClientRect();

        // hug the edge of the screen instead of overflowing horizontally
        const rightEdge = right - (x - sx);
        if (x + width > right) setLeft(rightEdge - width);

        // flip upwards instead of overflowing vertically
        if (y + height > bottom) setTop(sy - height - CURSOR_HEIGHT - CURSOR_PADDING);

        setCanDisplay();
        // `useBoolean` setters are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [x, y, children]);

    return (
        <>
            {/* invisible element used to measure the size of the children */}
            {createPortal(
                <div ref={fakeRef} className={className + ' pointer-events-none invisible absolute'}>
                    {children}
                </div>,
                document.body,
            )}
            {canDisplay &&
                createPortal(
                    <div className={className + ' absolute'} style={{ left, top }}>
                        {children}
                    </div>,
                    getShellRootElement()!,
                )}
        </>
    );
};
