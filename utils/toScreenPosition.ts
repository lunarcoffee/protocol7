import { Dimensions } from '@/components/contexts/system/WindowManager';

export const toScreenPosition = ({ x, y }: Dimensions) => {
  const [{ top, left }] = document
    .getElementById('window-layer')!
    .getClientRects();

  return { x: x - left, y: y - top };
};
