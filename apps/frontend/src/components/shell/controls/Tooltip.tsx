import ReactMarkdown from 'react-markdown';

import { PositionAnchor } from './PositionAnchor';
import { useBoolean } from '@/hooks/useBoolean';
import { useTimeout } from '@/hooks/useTimeout';

import type { PropsWithChildren } from 'react';

// TODO: maybe move this to a global user settings store eventually
const TOOLTIP_DELAY = 500;

export interface TooltipProps extends PropsWithChildren {
    label: string;

    className?: string;
    id?: string;
}

export const Tooltip = ({ label, className, children, id }: TooltipProps) => {
    const [isVisible, setVisible, setNotVisible] = useBoolean();
    const [cancelShow, restartShowAfterDelay] = useTimeout(TOOLTIP_DELAY, setVisible, setNotVisible);

    return (
        <div
            onMouseMove={() => restartShowAfterDelay()}
            onClick={cancelShow}
            onMouseLeave={cancelShow}
            className={className}
            id={id}
        >
            {children}
            {isVisible && (
                <PositionAnchor offsetForCursor className="z-[calc(infinity)]">
                    <div
                        className="
                            max-w-lg rounded-sm border border-aero-tint-dark bg-linear-to-b from-gray-100
                            to-aero-tint-highlight shadow-md shadow-aero-tint-darkest/30
                        "
                        // prevent the tooltip from being kept open if the mouse enters this div before it unmounts
                        onMouseMove={(event) => {
                            event.stopPropagation();
                            cancelShow();
                        }}
                    >
                        <div className="px-1 py-0.5 text-xs whitespace-pre-wrap text-aero-tint-dark">
                            <ReactMarkdown>{label}</ReactMarkdown>
                        </div>
                    </div>
                </PositionAnchor>
            )}
        </div>
    );
};
