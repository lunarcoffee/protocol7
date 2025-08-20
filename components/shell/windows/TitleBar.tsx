import { PropsWithWindowInfo } from '@/components/contexts/system/windows/WindowManager';
import { useWindowMaximize, useWindowMove } from '@/hooks/windows';
import { Dimensions } from '@/utils/Dimensions';
import { handleMouseDrag } from '@/utils/handleMouseDrag';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { ControlButtons } from './ControlButtons';

export const TitleBar = ({ windowInfo }: PropsWithWindowInfo) => {
  const { wid, title, position, isMaximized, hasFocus } = windowInfo;

  const moveWindow = useWindowMove();
  const maximizeWindow = useWindowMaximize();

  const onWindowDragStart = (initialPosition: Dimensions) =>
    handleMouseDrag({
      initialPosition,
      onMove: (dx, dy) =>
        moveWindow(wid, {
          x: position.x + dx,
          y: position.y + dy,
        }),
      cursor: 'move',
    });

  return (
    <div
      {...(!isMaximized && {
        onMouseDown: (event) =>
          onWindowDragStart({ x: event.clientX, y: event.clientY }),
      })}
      onDoubleClick={() => maximizeWindow(wid)}
      className={twMergeClsx(
        'z-10 flex flex-row items-center py-0.5 pr-1',
        hasFocus || 'brightness-75 grayscale-50',
        isMaximized && 'pr-2 pl-1',
      )}
    >
      <p
        className={`
          mr-4 overflow-hidden p-1 pt-[5px] text-xs text-nowrap text-ellipsis
        `}
      >
        {title}
      </p>
      <div className="grow" />
      <ControlButtons windowInfo={windowInfo} />
    </div>
  );
};
