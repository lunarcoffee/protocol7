import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren, useRef } from 'react';

import { useBoolean } from '@/hooks/useBoolean';

// TODO: maybe dedupe with `controls/Tooltip`?

const TOOLTIP_DELAY = 500;

export interface ViewerTooltipProps extends PropsWithChildren {
    label: string;

    isFullscreen: boolean;
    className: string;
}

export const ViewerTooltip = ({ label, isFullscreen, className, children }: ViewerTooltipProps) => {
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
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={clsx(
                            `
                                absolute -top-1 z-20 rounded-full border border-neutral-400/40
                                bg-neutral-950/70 font-manrope shadow-[0_0_0_1px] shadow-neutral-950
                                backdrop-blur-sm
                            `,
                            isFullscreen ? 'left-7.5' : 'left-9',
                        )}
                        onMouseLeave={cancelShow}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.05 }}
                    >
                        <div className="px-2.5 py-1 text-xs text-nowrap text-neutral-300">{label}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
