import clsx from 'clsx';
import { useRef, useState } from 'react';

import { useBoolean } from '@/hooks/useBoolean';

import { SystemStoreProvider } from '../../stores/system/SystemStoreProvider';
import { GraphicalShell } from '../shell/GraphicalShell';
import { ViewerControls } from './ViewerControls';

const LoadingFallback = () => (
    <div className="flex size-full items-center justify-center inset-shadow-[0_0_10rem] inset-shadow-white/15">
        <p className="font-manrope text-lg text-white/80">Establishing connection to remote shell...</p>
    </div>
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

    return (
        <div
            ref={viewerRef}
            className="
                flex h-lvh w-lvw items-center justify-center bg-neutral-950 p-10 font-open-sans select-none
            "
        >
            {/* when not in fullscreen, maintain 3:2 aspect ratio but take up at most 90% of the entire viewport */}
            <div
                onContextMenu={(event) => event.preventDefault()}
                className={clsx(
                    'absolute inset-0',
                    isFullscreen || 'm-auto h-[calc(2/3*90lvw)] max-h-9/10 w-9/10 max-w-[calc(3/2*90lvh)]',
                )}
            >
                <ViewerControls
                    isFullscreen={isFullscreen}
                    enterFullscreen={enterFullscreen}
                    exitFullscreen={exitFullscreen}
                />
                <SystemStoreProvider key={hostname} hostname={hostname} fallback={<LoadingFallback />}>
                    <div className="absolute z-0 size-full overflow-clip">
                        <GraphicalShell />
                    </div>
                </SystemStoreProvider>
            </div>
        </div>
    );
};
