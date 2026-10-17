import { useDestroyWindow, useMaximizeWindow, useMinimizeWindow } from '@/hooks/windows';

import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

const ControlButton = ({
    bgFrom,
    bgTo,
    outline,
    topGlow,
    topShadow,
    bottomGlow,
    onClick,
}: {
    bgFrom: string;
    bgTo: string;
    outline: string;
    topGlow: string;
    topShadow: string;
    bottomGlow: string;
    onClick: () => void;
}) => (
    // this is a workaround for a Safari quirk where applying the brightness filter on the inner div causes the outline
    // to disappear for some reason
    <div
        className="
            size-4
            hover:brightness-125
            active:brightness-80
        "
    >
        <div
            onClick={onClick}
            // prevent dragging a window by the buttons
            onMouseDown={(event) => event.stopPropagation()}
            className={`
                size-full rounded-full bg-linear-to-t
                ${bgFrom}
                ${bgTo}
                inset-shadow-sm inset-shadow-black/70 outline
                ${outline}
                group overflow-clip shadow-sm shadow-white/80 transition duration-75
                hover:shadow-white
                active:shadow-white
            `}
        >
            <div className="relative">
                {/* top reflective glow */}
                <div
                    className={`
                        absolute -mt-1 -ml-1 h-3 w-6 rounded-full bg-radial
                        ${topGlow}
                        to-transparent to-50%
                        group-hover:brightness-125
                        group-active:brightness-80
                    `}
                />
                {/* upper half drop shadow */}
                <div
                    className={`
                        absolute size-4 rounded-full inset-shadow-[0_1px_2px]
                        ${topShadow}
                    `}
                />
                {/* bottom glow */}
                <div
                    className={`
                        absolute mt-2 size-4 rounded-full bg-radial
                        ${bottomGlow}
                        to-transparent to-70%
                    `}
                />
            </div>
        </div>
    </div>
);

export const ControlButtons = ({ windowInfo: { wid } }: PropsWithWindowInfo) => {
    const minimizeWindow = useMinimizeWindow();
    const maximizeWindow = useMaximizeWindow();
    const destroyWindow = useDestroyWindow();

    return (
        <div className="flex flex-row items-center gap-2">
            <ControlButton
                bgFrom="from-lime-500"
                bgTo="to-lime-900"
                outline="outline-lime-950"
                topGlow="from-lime-200"
                topShadow="inset-shadow-lime-950"
                bottomGlow="from-lime-300"
                onClick={() => minimizeWindow(wid)}
            />
            <ControlButton
                bgFrom="from-yellow-400"
                bgTo="to-yellow-800"
                outline="outline-yellow-950"
                topGlow="from-yellow-200"
                topShadow="inset-shadow-yellow-950"
                bottomGlow="from-yellow-300"
                onClick={() => maximizeWindow(wid)}
            />
            <ControlButton
                bgFrom="from-red-500"
                bgTo="to-red-900"
                outline="outline-red-950"
                topGlow="from-red-200"
                topShadow="inset-shadow-red-950"
                bottomGlow="from-red-300"
                onClick={() => destroyWindow(wid)}
            />
        </div>
    );
};
