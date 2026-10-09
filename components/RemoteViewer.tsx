import clsx from 'clsx';
import { useRef, useState } from 'react';

import { useBoolean } from '@/hooks/useBoolean';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { SystemStoreProvider } from '../stores/system/SystemStoreProvider';
import { GraphicalShell } from './shell/GraphicalShell';

const LoadingFallback = () => (
    <div className="flex size-full items-center justify-center inset-shadow-[0_0_10rem] inset-shadow-white/15">
        <p className="font-manrope text-lg text-white/80">Establishing connection to remote shell...</p>
    </div>
);

interface ViewerControlButtonProps {
    src: string;
    alt: string;
    size?: number;
    onClick: () => void;
}

const ViewerControlButton = ({ size = 18, alt, ...props }: ViewerControlButtonProps) => (
    // TODO: custom tooltip design
    <img alt={alt} title={alt} width={size} {...props} className="cursor-pointer" draggable={false} />
);

interface ViewerControlsProps {
    isFullscreen: boolean;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
}

const ViewerControls = ({ isFullscreen, enterFullscreen, exitFullscreen }: ViewerControlsProps) => {
    const [isInitialReveal, setIsInitialReveal, setNotInitialReveal] = useBoolean();

    const onClickFullscreen = () => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            // upon fullscreening, make the controls visible for a time to help indicate where they are
            enterFullscreen();
            setIsInitialReveal();
            setTimeout(setNotInitialReveal, 2000);
        }
    };

    const buttons = (
        <div
            className={twMergeClsx(
                'flex size-full flex-col items-center justify-between px-2 py-4',
                isFullscreen
                    ? `
                        invert-40
                        *:hover:invert-120
                    `
                    : `
                        invert-30
                        *:hover:invert-50
                    `,
            )}
        >
            <ViewerControlButton src="/icons/globe.svg" alt="Select host" onClick={() => {}} />
            <ViewerControlButton src="/icons/info.svg" alt="Host info" onClick={() => {}} />
            <ViewerControlButton
                src={`/icons/fullscreen${isFullscreen ? '-exit' : ''}.svg`}
                alt={(isFullscreen ? 'Exit' : 'Enter') + ' fullscreen'}
                size={isFullscreen ? 17 : 15}
                onClick={onClickFullscreen}
            />
        </div>
    );

    return isFullscreen ? (
        // this outer div draws the hoverable area to reveal controls
        <div className="group absolute top-4 left-0 z-10 h-32 w-1" onMouseEnter={setNotInitialReveal}>
            <div
                className={twMergeClsx(
                    `
                        -ml-8 h-full w-8 rounded-r-lg bg-neutral-950 transition-[margin] duration-100 ease-out
                        group-hover:ml-0
                    `,
                    isInitialReveal && 'ml-0 animate-[pulse_0.66s_cubic-bezier(0.4,0,0.6,1)_infinite]',
                )}
            >
                {buttons}
            </div>
        </div>
    ) : (
        <div className="absolute -left-10 h-32 w-8">{buttons}</div>
    );
};

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
