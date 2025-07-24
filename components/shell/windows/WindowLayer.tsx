'use client';

import { useNextProcessID } from '@/hooks/processes/useNextProcessID';
import { useNextWindowID } from '@/hooks/windows/useNextWindowID';
import { useWindowCreate } from '@/hooks/windows/useWindowCreate';
import { useWindowManager } from '../../contexts/WindowManagerContext';
import { WindowFrame } from './WindowFrame';
import { AnimatePresence } from 'motion/react';
import { useProcessCreate } from '@/hooks/processes/useProcessCreate';

export const WindowLayer = () => {
  const [{ windows }] = useWindowManager();
  const windowsArray = Array.from(windows.values());

  const createProcess = useProcessCreate();
  const createWindow = useWindowCreate();

  const nextPid = useNextProcessID();
  const nextWid = useNextWindowID();

  return (
    <div className="absolute top-0 left-0">
      <button
        onClick={() => {
          createProcess(nextPid);
          createWindow({
            pid: nextPid,
            wid: nextWid,
            title: 'New window',
            size: { x: 500, y: 300 },
            render: (windowInfo) => (
              <WindowFrame windowInfo={windowInfo}>
                <div className="size-full p-4 bg-gray-300">
                  <p className="text-blue-900 text-shadow-none">this is a window!</p>
                </div>
              </WindowFrame>
            ),
          });
        }}
        className="size-5 absolute top-0 left-0 bg-amber-400"
      >
        open sesame
      </button>
      <AnimatePresence>
        {windowsArray.map((info) => {
          const { wid, render } = info;
          return <div key={wid}>{render(info)}</div>;
        })}
      </AnimatePresence>
    </div>
  );
};
