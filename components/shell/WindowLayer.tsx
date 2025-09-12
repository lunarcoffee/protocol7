'use client';

import { AnimatePresence } from 'motion/react';

import { useWindowManager } from '@/hooks/useWindowManager';

export const WindowLayer = () => {
  const { windows } = useWindowManager();

  return (
    <div id="window-layer" className="absolute top-0 right-0 bottom-0 left-0">
      <AnimatePresence>
        {Array.from(windows.values(), (info) => {
          const { wid, render } = info;
          return <div key={wid}>{render(info)}</div>;
        })}
      </AnimatePresence>
    </div>
  );
};
