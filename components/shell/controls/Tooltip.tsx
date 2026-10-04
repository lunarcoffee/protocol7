import { MouseEvent } from 'react';
import { PropsWithChildren, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';

import { useBoolean } from '@/hooks/useBoolean';
import { Dimensions, toScreenPosition } from '@/utils/Dimensions';

// TODO: maybe move this to a global user settings store eventually
const TOOLTIP_DELAY = 500;

// TODO: maybe implement custom cursors so this isn't a guessing game
const CURSOR_HEIGHT = 20;

export interface TooltipProps extends PropsWithChildren {
    label: string;
    className?: string;
}

export const Tooltip = ({ label, children, className }: TooltipProps) => {
    const [position, setPosition] = useState<Dimensions>();
    const [isVisible, setVisible, setNotVisible] = useBoolean();

    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const cancelShow = () => {
        setNotVisible();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const resetShowAfterDelay = ({ clientX, clientY }: MouseEvent) => {
        cancelShow();
        setPosition(toScreenPosition({ x: clientX, y: clientY + CURSOR_HEIGHT }));
        timeoutRef.current = setTimeout(setVisible, TOOLTIP_DELAY);
    };

    return (
        <div onMouseMove={resetShowAfterDelay} onMouseLeave={cancelShow} className={className}>
            {children}
            {isVisible &&
                position &&
                createPortal(
                    <div
                        className="
                            absolute z-[calc(infinity)] max-w-lg rounded-sm border border-aero-tint-dark
                            bg-linear-to-b from-gray-200 to-aero-tint-highlight shadow-md
                            shadow-aero-tint-darkest/30
                        "
                        style={{ top: position.y, left: position.x }}
                        // this shouldn't be necessary but i somehow got a stuck tooltip once while testing; if that
                        // ever happens, this should make it easy to clear
                        onMouseLeave={cancelShow}
                    >
                        <div className="px-1 py-0.5 text-xs whitespace-pre-wrap text-aero-tint-dark">
                            <ReactMarkdown>{label}</ReactMarkdown>
                        </div>
                    </div>,
                    document.getElementById('shell')!,
                )}
        </div>
    );
};
