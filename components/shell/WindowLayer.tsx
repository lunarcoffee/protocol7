'use client';

import { AnimatePresence } from 'motion/react';

import { useNextProcessID } from '@/hooks/processes/useNextProcessID';
import { useProcessCreate } from '@/hooks/processes/useProcessCreate';
import { useNextWindowID } from '@/hooks/windows/useNextWindowID';
import { useWindowCreate } from '@/hooks/windows/useWindowCreate';

import { useWindowManager } from '../contexts/WindowManagerContext';
import { Desktop } from './Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { WindowFrame } from './windows/WindowFrame';

export const WindowLayer = () => {
  const [{ windows }] = useWindowManager();
  const windowsArray = Array.from(windows.values());

  const createProcess = useProcessCreate();
  const createWindow = useWindowCreate();

  const nextPid = useNextProcessID();
  const nextWid = useNextWindowID();

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0">
      <Desktop />
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
                <div className="size-full bg-gray-100 p-4">
                  <p className="text-blue-900 text-shadow-none">
                    this is a window!
                  </p>
                </div>
              </WindowFrame>
            ),
          });
        }}
        className="absolute top-0 left-0 size-5 bg-amber-400"
      >
        open sesame
      </button>
      <AnimatePresence>
        {windowsArray.map((info) => {
          const { wid, render } = info;
          return <div key={wid}>{render(info)}</div>;
        })}
      </AnimatePresence>
      <Taskbar />
    </div>
  );
};
