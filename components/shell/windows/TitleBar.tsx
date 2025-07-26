import { PropsWithWindowInfo } from '@/components/contexts/WindowManagerContext';
import { useWindowMove } from '@/hooks/windows/useWindowMove';
import { handleMouseDrag } from '@/utils/handleMouseDrag';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ControlButtons } from './ControlButtons';
import { useWindowMaximize } from '@/hooks/windows/useWindowMaximize';

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
      className={twMerge(
        clsx(
          'flex flex-row max-width-[100%] items-center p-1',
          hasFocus || 'brightness-75 grayscale-50',
          isMaximized && 'px-2',
        ),
      )}
    >
      <p className="pt-px mr-4 text-sm text-ellipsis text-nowrap overflow-hidden">
        {title}
      </p>
      <div className="grow" />
      <ControlButtons windowInfo={windowInfo} />
    </div>
  );
};
