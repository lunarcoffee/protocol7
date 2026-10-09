import { useBoolean } from '@/hooks/useBoolean';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { FullscreenEnterIcon } from '../icons/FullscreenEnterIcon';
import { FullscreenExitIcon } from '../icons/FullscreenExitIcon';
import { GlobeIcon } from '../icons/GlobeIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { IconComponentType } from '../icons/types';
import { ViewerTooltip } from './ViewerTooltip';

interface ViewerControlButtonProps {
    Icon: IconComponentType;
    tooltip: string;
    size?: number;
    onClick: () => void;

    isFullscreen: boolean;
}

const ViewerControlButton = ({ Icon, tooltip, size = 18, onClick, isFullscreen }: ViewerControlButtonProps) => (
    <ViewerTooltip label={tooltip} isFullscreen={isFullscreen} className="relative cursor-pointer">
        <Icon width={size} height={size} onClick={onClick} />
    </ViewerTooltip>
);

interface ViewerControlButtonsProps extends ViewerControlProps {
    setIsInitialReveal: () => void;
    setNotInitialReveal: () => void;
}

const ViewerControlButtons = ({
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    setIsInitialReveal,
    setNotInitialReveal,
}: ViewerControlButtonsProps) => {
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

    return (
        <div
            className={twMergeClsx(
                'flex size-full flex-col items-center justify-between px-2 py-4',
                isFullscreen
                    ? `
                        text-neutral-600
                        *:hover:text-neutral-400
                    `
                    : `
                        text-neutral-700
                        *:hover:text-neutral-500
                    `,
            )}
        >
            <ViewerControlButton
                Icon={GlobeIcon}
                tooltip="Select host"
                onClick={() => {}}
                isFullscreen={isFullscreen}
            />
            <ViewerControlButton Icon={InfoIcon} tooltip="Host info" onClick={() => {}} isFullscreen={isFullscreen} />
            <ViewerControlButton
                Icon={isFullscreen ? FullscreenExitIcon : FullscreenEnterIcon}
                tooltip={(isFullscreen ? 'Exit' : 'Enter') + ' fullscreen'}
                size={isFullscreen ? 17 : 16}
                onClick={onClickFullscreen}
                isFullscreen={isFullscreen}
            />
        </div>
    );
};

export interface ViewerControlProps {
    isFullscreen: boolean;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
}

export const ViewerControls = (props: ViewerControlProps) => {
    const [isInitialReveal, setIsInitialReveal, setNotInitialReveal] = useBoolean();

    return props.isFullscreen ? (
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
                <ViewerControlButtons
                    {...props}
                    setIsInitialReveal={setIsInitialReveal}
                    setNotInitialReveal={setNotInitialReveal}
                />
            </div>
        </div>
    ) : (
        <div className="absolute -left-10 h-32 w-8">
            <ViewerControlButtons
                {...props}
                setIsInitialReveal={setIsInitialReveal}
                setNotInitialReveal={setNotInitialReveal}
            />
        </div>
    );
};
