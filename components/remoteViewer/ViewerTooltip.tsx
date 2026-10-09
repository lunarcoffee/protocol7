import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren } from 'react';

import { useBoolean } from '@/hooks/useBoolean';
import { useTimeout } from '@/hooks/useTimeout';

const TOOLTIP_DELAY = 500;

export interface ViewerTooltipProps extends PropsWithChildren {
    label: string;

    isFullscreen: boolean;
    className: string;
}

export const ViewerTooltip = ({ label, isFullscreen, className, children }: ViewerTooltipProps) => {
    const [isVisible, setVisible, setNotVisible] = useBoolean();
    const [cancelShow, restartShowAfterDelay] = useTimeout(setVisible, setNotVisible, TOOLTIP_DELAY);

    return (
        <div onMouseMove={restartShowAfterDelay} onClick={cancelShow} onMouseLeave={cancelShow} className={className}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={clsx(
                            `
                                absolute -top-1 z-20 rounded-full border border-neutral-400/40 bg-neutral-900
                                font-manrope shadow-[0_0_0_1px] shadow-neutral-950 backdrop-blur-sm
                            `,
                            isFullscreen ? 'left-7.5' : 'left-9',
                        )}
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
