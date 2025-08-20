'use client';

export interface Dimensions {
  x: number;
  y: number;
}

export const toScreenPosition = ({ x, y }: Dimensions) => {
  if (typeof window === 'undefined') return { x, y };

  const windowLayer = document.getElementById('window-layer');
  if (!windowLayer) return { x, y };

  const [{ top, left }] = windowLayer.getClientRects();
  return { x: x - left, y: y - top };
};
