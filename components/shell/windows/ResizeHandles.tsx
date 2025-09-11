import { PropsWithWindowInfo } from '@/components/contexts/system/windows/WindowManager';
import { useWindowManager } from '@/hooks/useWindowManager';
import { Dimensions } from '@/utils/Dimensions';
import { handleMouseDrag } from '@/utils/handleMouseDrag';

const RESIZE_HANDLES: [string, number, number, string][] = [
  // top, right, bottom, left
  ['-top-0.5 left-0 w-full h-1.5', 0, -1, 'n-resize'],
  ['-right-0.5 top-0 w-1.5 h-full', 1, 0, 'e-resize'],
  ['-bottom-0.5 left-0 w-full h-1.5', 0, 1, 's-resize'],
  ['-left-0.5 top-0 w-1.5 h-full', -1, 0, 'w-resize'],
  // top left, top right, bottom right, bottom left
  ['-top-0.5 -left-0.5 size-3 rounded-br-full', -1, -1, 'nwse-resize'],
  ['-top-0.5 -right-0.5 size-3 rounded-bl-full', 1, -1, 'nesw-resize'],
  ['-bottom-0.5 -right-0.5 size-3 rounded-tl-full', 1, 1, 'nwse-resize'],
  ['-bottom-0.5 -left-0.5 size-3 rounded-tr-full', -1, 1, 'nesw-resize'],
];

export const ResizeHandles = ({
  windowInfo: { wid, size },
}: PropsWithWindowInfo) => {
  const wm = useWindowManager();

  const onWindowResizeStart = (
    initialPosition: Dimensions,
    xMul: number,
    yMul: number,
    cursor: string,
  ) =>
    handleMouseDrag({
      initialPosition,
      onMove: (dx, dy) =>
        wm.resize(
          wid,
          { x: size.x + dx * xMul, y: size.y + dy * yMul },
          xMul < 0,
          yMul < 0,
        ),
      cursor,
    });

  return (
    <div>
      {RESIZE_HANDLES.map(([style, ...args]) => (
        <div
          onMouseDown={(event) =>
            onWindowResizeStart({ x: event.clientX, y: event.clientY }, ...args)
          }
          className={`
            absolute
            ${style}
          `}
          style={{ cursor: args[2] }}
          key={style}
        />
      ))}
    </div>
  );
};
