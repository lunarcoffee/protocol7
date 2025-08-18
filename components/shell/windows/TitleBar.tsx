import { PropsWithWindowInfo } from '@/components/contexts/WindowManagerContext';
import { useWindowMaximize } from '@/hooks/windows/useWindowMaximize';
import { useWindowMove } from '@/hooks/windows/useWindowMove';
import { handleMouseDrag } from '@/utils/handleMouseDrag';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { ControlButtons } from './ControlButtons';

export const TitleBar = ({ windowInfo }: PropsWithWindowInfo) => {
  const { wid, title, position, isMaximized, hasFocus } = windowInfo;

  const moveWindow = useWindowMove();
  const maximizeWindow = useWindowMaximize();

  const onWindowDragStart = (initialX: number, initialY: number) =>
    handleMouseDrag(
      { x: initialX, y: initialY },
      (dx, dy) =>
        moveWindow(wid, {
          x: position.x + dx,
          y: position.y + dy,
        }),
      'move',
    );

  return (
    <div
      {...(!isMaximized && {
        onMouseDown: (event) => onWindowDragStart(event.clientX, event.clientY),
      })}
      onDoubleClick={() => maximizeWindow(wid)}
      className={twMergeClsx(
        'z-10 flex flex-row items-center p-1',
        hasFocus || 'brightness-75 grayscale-50',
        isMaximized && 'px-2',
      )}
    >
      <p
        className={`
          mr-4 overflow-hidden pt-px text-sm text-nowrap text-ellipsis
        `}
      >
        {title}
      </p>
      <div className="grow" />
      <ControlButtons windowInfo={windowInfo} />
    </div>
  );
};
