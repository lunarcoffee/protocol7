import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';

import { useBoolean } from '@/hooks/useBoolean';

import { useInitializeSystem } from '../../hooks/system/useInitializeSystem';
import { GraphicalShell } from '../shell/GraphicalShell';
import { ViewerControls } from './ViewerControls';

const LoadingFallback = () => (
    <motion.div
        className="absolute z-10 flex size-full bg-neutral-950"
        // slightly artificially delay the transition to allow assets to load; if we implement something to track files
        // loaded in the filesystem we can make this more accurate
        exit={{ opacity: 0 }}
        transition={{ duration: 1, delay: 1, ease: 'circIn' }}
    >
        <div className="absolute size-full animate-pulse inset-shadow-[0_0_16vh] inset-shadow-white/15" />
        <p className="m-auto text-lg text-white/80">
            establishing connection to remote shell
            <span className="animate-ellipsis-ping [animation-delay:0.3s]">.</span>
            <span className="animate-ellipsis-ping [animation-delay:0.5s]">.</span>
            <span className="animate-ellipsis-ping [animation-delay:0.7s]">.</span>
        </p>
    </motion.div>
);

export const RemoteViewer = () => {
    const viewerRef = useRef<HTMLDivElement>(null);

    const [hostname] = useState('localhost');
    const [isFullscreen, setIsFullscreen, setNotFullscreen] = useBoolean();

    const enterFullscreen = () => {
        setIsFullscreen();
        if (document.fullscreenEnabled) viewerRef.current?.requestFullscreen();
    };
    const exitFullscreen = () => {
        setNotFullscreen();
        if (document.fullscreenElement) document.exitFullscreen();
    };

    const isReady = useInitializeSystem(hostname);

    return (
        <div
            ref={viewerRef}
            className="
                flex h-lvh w-lvw animate-fade-in bg-neutral-950 font-manrope tracking-wider select-none
            "
        >
            <div
                // when not fullscreened, maintain 3:2 aspect ratio but take up at most 90% of either dimension; also
                // make sure there's enough room for the control buttons (`3rem` on the left, so `6rem` total)
                className={clsx(
                    'absolute inset-0',
                    isFullscreen || 'm-auto aspect-3/2 max-h-9/10 w-9/10 max-w-[min(3/2*90lvh,100lvw-6rem)]',
                )}
                onContextMenu={(event) => event.preventDefault()}
            >
                <ViewerControls
                    isFullscreen={isFullscreen}
                    enterFullscreen={enterFullscreen}
                    exitFullscreen={exitFullscreen}
                    disabled={!isReady}
                />
                <AnimatePresence>
                    {isReady ? (
                        <div className="absolute z-0 size-full overflow-clip font-open-sans tracking-normal">
                            <GraphicalShell />
                        </div>
                    ) : (
                        <LoadingFallback key="loading-fallback" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
