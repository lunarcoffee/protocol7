import { cn } from 'cn';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { getMousePosition } from '@/utils/getMousePosition';
import { getShellRootElement } from '@/utils/getShellRootElement';

import type { Dimensions } from '@/utils/Dimensions';

// TODO: maybe implement custom cursors so this isn't a guessing game
const CURSOR_HEIGHT = 20;
const CURSOR_PADDING = 8;

const toScreenPosition = (position: Dimensions, offsetForCursor?: boolean) => {
    let { x, y } = position;
    if (offsetForCursor) {
        x += CURSOR_PADDING;
        y += CURSOR_HEIGHT;
    }

    const shellRect = getShellRootElement()!.getBoundingClientRect();
    return [x - shellRect.left, y - shellRect.top] as const;
};

export interface PositionAnchorProps extends PropsWithChildren {
    // position in client coordinates; defaults to the cursor position at the time of first render
    position?: Dimensions;

    // if the children overflow the screen horizontally, anchor the children's right edge to this coordinate; if not
    // provided, this defaults to the right edge of the screen
    fallbackX?: number;
    // whether to nudge the contents out of the way of the cursor
    offsetForCursor?: boolean;

    className?: string;
}

// tries to anchor `children` to the bottom right of the given `position`, adjusting as necessary to keep the entire
// contents visible on the screen without clipping
export const PositionAnchor = ({ position, fallbackX, offsetForCursor, className, children }: PositionAnchorProps) => {
    // initial anchor position
    const [screenX, screenY] = toScreenPosition(position ?? getMousePosition(), offsetForCursor);

    // actual anchor position; may be updated after the `children` are measured if they overflow the screen
    const [left, setLeft] = useState(screenX);
    const [top, setTop] = useState(screenY);

    // set after the `children` are measured and the above values are updated
    const [canDisplay, setCanDisplay] = useBoolean();

    const fakeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!fakeRef.current) return;

        const { width: screenWidth, height: screenHeight } = getShellRootElement()!.getBoundingClientRect();
        const { width: childrenWidth, height: childrenHeight } = fakeRef.current.getBoundingClientRect();

        // hug the edge of the screen (or the given fallback position) instead of overflowing horizontally
        const fallback = fallbackX ? toScreenPosition({ x: fallbackX, y: 0 }, offsetForCursor)[0] : screenWidth;
        if (screenX + childrenWidth > screenWidth) setLeft(fallback - childrenWidth);

        // flip upwards instead of overflowing vertically
        const cursorPadding = offsetForCursor ? CURSOR_HEIGHT + CURSOR_PADDING : 0;
        if (screenY + childrenHeight > screenHeight) setTop(screenY - childrenHeight - cursorPadding);

        setCanDisplay();
    }, [screenX, screenY, fallbackX, offsetForCursor, setCanDisplay]);

    return (
        <>
            {/* invisible element used to measure the size of the children */}
            {createPortal(
                <div ref={fakeRef} className={cn(className, 'pointer-events-none invisible absolute')}>
                    {children}
                </div>,
                document.body,
            )}

            {canDisplay &&
                createPortal(
                    <div className={cn(className, 'absolute')} style={{ left, top }}>
                        {children}
                    </div>,
                    getShellRootElement()!,
                )}
        </>
    );
};
