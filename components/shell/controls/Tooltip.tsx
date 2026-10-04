import { PropsWithChildren, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';

import { useBoolean } from '@/hooks/useBoolean';
import { getShellRootElement } from '@/utils/getShellRootElement';

import { PositionAnchor } from './PositionAnchor';

// TODO: maybe move this to a global user settings store eventually
const TOOLTIP_DELAY = 500;

export interface TooltipProps extends PropsWithChildren {
    label: string;

    className?: string;
}

export const Tooltip = ({ label, className, children }: TooltipProps) => {
    const [isVisible, setVisible, setNotVisible] = useBoolean();

    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const cancelShow = () => {
        setNotVisible();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const resetShowAfterDelay = () => {
        cancelShow();
        timeoutRef.current = setTimeout(setVisible, TOOLTIP_DELAY);
    };

    return (
        <div onMouseMove={resetShowAfterDelay} onClick={cancelShow} onMouseLeave={cancelShow} className={className}>
            {children}
            {isVisible &&
                createPortal(
                    <PositionAnchor offsetForCursor className="z-[calc(infinity)]">
                        <div
                            className="
                                max-w-lg rounded-sm border border-aero-tint-dark bg-linear-to-b from-gray-200
                                to-aero-tint-highlight shadow-md shadow-aero-tint-darkest/30
                            "
                            // this shouldn't be necessary but i somehow got a stuck tooltip once while testing; if that
                            // ever happens, this should make it easy to clear
                            onMouseLeave={cancelShow}
                        >
                            <div className="px-1 py-0.5 text-xs whitespace-pre-wrap text-aero-tint-dark">
                                <ReactMarkdown>{label}</ReactMarkdown>
                            </div>
                        </div>
                    </PositionAnchor>,
                    getShellRootElement()!,
                )}
        </div>
    );
};
