import { Dimensions } from '@/components/contexts/system/windows/WindowManager';

export interface HandleMouseDragArgs {
  initialPosition: Dimensions;

  onMove: (dx: number, dy: number, event: MouseEvent) => void;
  onDragEnd?: () => void;

  // cursor style to apply for the duration of the gesture
  cursor?: string;
}

// useful in `onMouseDown` handlers where you want to track the associated drag gesture that comes
// after - see `WindowFrame` or `ResizeHandles` for examples
export const handleMouseDrag = ({
  initialPosition: { x, y },
  onMove,
  onDragEnd,
  cursor,
}: HandleMouseDragArgs) => {
  if (cursor) document.body.style.cursor = cursor;

  const mouseMoveListener = (rawEvent: Event) => {
    const event = rawEvent as MouseEvent;
    const dx = event.clientX - x;
    const dy = event.clientY - y;

    onMove(dx, dy, event);
  };

  const mouseUpListener = () => {
    document.removeEventListener('mousemove', mouseMoveListener);
    document.removeEventListener('mouseup', mouseUpListener);

    if (cursor) document.body.style.cursor = 'unset';

    onDragEnd?.();
  };

  document.addEventListener('mousemove', mouseMoveListener);
  document.addEventListener('mouseup', mouseUpListener);
};
