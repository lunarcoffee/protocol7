import {
  Dimensions,
  PropsWithWindowInfo,
} from '@/components/contexts/system/WindowManager';
import { useWindowMaximize, useWindowMove } from '@/hooks/windows';
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
        'z-10 flex flex-row items-center px-1 py-1.5',
        hasFocus || 'brightness-75 grayscale-50',
        isMaximized && 'px-2',
      )}
    >
      <p
        className={`
          mr-4 overflow-hidden pt-px text-xs text-nowrap text-ellipsis
        `}
      >
        {title}
      </p>
      <div className="grow" />
      <ControlButtons windowInfo={windowInfo} />
    </div>
  );
};
