'use client'; // TODO: remove this if we move teh window manager out adn no longer need hooks

import Image from 'next/image';
import Wallpaper from '@/public/wallpapers/subway.jpg';
import { ProcessManagerContextProvider } from './contexts/ProcessManagerContext';
import { Taskbar } from './taskbar/Taskbar';

import { enableMapSet } from 'immer';
import { WindowFrame } from './controls/WindowFrame';
import { useNextProcessID } from '@/hooks/useNextProcessID';
import { useWindowCreate } from '@/hooks/useWindowCreate';
import { useNextWindowID } from '@/hooks/useNextWindowID';
import {
  useWindowManager,
  WindowManagerContextProvider,
} from './contexts/WindowManagerContext';

enableMapSet();
// TODO: collage wallpaper
//

const WindowManager = () => {
  const [{ windows }] = useWindowManager();
  const windowsArray = Array.from(windows.values());
  const createWindow = useWindowCreate();

  const pid = useNextProcessID();
  const wid = useNextWindowID();

  return (
    <div className="absolute top-0 left-0 size-full">
      <button
        onClick={() => {
          createWindow({
            pid,
            wid,
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
        const { wid, render, zIndex } = info;
        return (
          <div key={wid} style={{ zIndex }}>
            {render(info)}
          </div>
        );
      })}
    </div>
  );
};

const Desktop = () => {
  return (
    <div className="aspect-[16/10] max-w-[144lvh] min-w-0 max-h-[90lvh] min-h-0 overflow-clip relative">
      <Image src={Wallpaper} alt="desktop wallpaper" draggable={false} />
      <ProcessManagerContextProvider>
        <WindowManagerContextProvider>
          <WindowManager />
          <Taskbar />
        </WindowManagerContextProvider>
      </ProcessManagerContextProvider>
    </div>
  );
};

export const Computer = () => (
  <div className="w-lvw h-lvh p-10 flex items-center justify-center select-none">
    <Desktop />
  </div>
);
