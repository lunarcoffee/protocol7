import { cn } from 'cn';

import { ControlButtons } from './ControlButtons';
import { useMaximizeWindow, useMoveWindow } from '@/hooks/windows';
import { getSystemIcon } from '@/utils/getSystemIcon';
import { handleMouseDrag } from '@/utils/handleMouseDrag';

import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';
import type { Dimensions } from '@/utils/Dimensions';

export interface TitleBarProps extends PropsWithWindowInfo {
    icon: string;
}

export const TitleBar = ({ icon, winfo }: TitleBarProps) => {
    const { wid, title, position, isMaximized, hasFocus } = winfo;

    const moveWindow = useMoveWindow();
    const maximizeWindow = useMaximizeWindow();

    const onWindowDragStart = (initialPosition: Dimensions) =>
        handleMouseDrag({
            initialPosition,
            onMove: (dx, dy) => moveWindow(wid, { x: position.x + dx, y: position.y + dy }),
            cursor: 'move',
        });

    return (
        <div
            {...(!isMaximized && {
                onMouseDown: (event) => onWindowDragStart({ x: event.clientX, y: event.clientY }),
            })}
            onDoubleClick={() => maximizeWindow(wid)}
            className={cn(
                'z-10 flex flex-row items-center py-0.5 pr-1',
                hasFocus || 'brightness-75 grayscale-50',
                isMaximized && 'pr-2 pl-[0.2rem]',
            )}
        >
            <img
                src={getSystemIcon(icon)}
                width={16}
                className="mr-px ml-1 pt-px drop-shadow-xs drop-shadow-aero-tint-darkest/50"
            />
            <p className="mr-4 overflow-hidden p-1 pt-1.25 text-xs text-nowrap text-ellipsis">{title}</p>
            <div className="grow" />
            <ControlButtons winfo={winfo} />
        </div>
    );
};
