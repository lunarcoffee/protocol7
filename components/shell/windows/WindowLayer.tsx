'use client';

import { useNextProcessID } from '@/hooks/useNextProcessID';
import { useNextWindowID } from '@/hooks/useNextWindowID';
import { useWindowCreate } from '@/hooks/useWindowCreate';
import { useWindowManager } from '../../contexts/WindowManagerContext';
import { WindowFrame } from './WindowFrame';

export const WindowLayer = () => {
  const [{ windows }] = useWindowManager();
  const windowsArray = Array.from(windows.values());

  const createWindow = useWindowCreate();

  const nextPid = useNextProcessID();
  const nextWid = useNextWindowID();

  return (
    <div className="absolute top-0 left-0">
      <button
        onClick={() => {
          createWindow({
            pid: nextPid,
            wid: nextWid,
            title: 'Random title lol',
            size: { x: 500, y: 300 },
            render: (windowInfo) => (
              <WindowFrame windowInfo={windowInfo}>
                this is a window!
              </WindowFrame>
            ),
          });
        }}
        className="size-5 absolute top-0 left-0 bg-amber-400"
      >
        open sesame
      </button>
      {windowsArray.map((info) => {
        const { wid, render } = info;
        return <div key={wid}>{render(info)}</div>;
      })}
    </div>
  );
};
