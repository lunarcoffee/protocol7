'use client'; // TODO: remove this if we move teh window manager out adn no longer need hooks

import Image from 'next/image';
import Wallpaper from '../public/wallpapers/toronto.jpg';
import {
  ProcessTableContextProvider,
  useProcessTable,
} from './contexts/ProcessInfoContext';
import { Taskbar } from './taskbar/Taskbar';

import { enableMapSet } from 'immer';
import { WindowFrame } from './controls/WindowFrame';

enableMapSet();
// TODO: collage wallpaper

const WindowManager = () => {
  const [processTable, updateProcessTable] = useProcessTable();
  const processes = Array.from(processTable.values());

  return (
    <div className="absolute top-0 left-0 size-full">
      <button
        onClick={() =>
          updateProcessTable({
            action: 'create',
            render: (windowInfo) => (
              <WindowFrame windowInfo={windowInfo}>
                this is a window!
              </WindowFrame>
            ),
          })
        }
        className="size-5 absolute top-0 left-0 bg-amber-400"
      >
        open sesame
      </button>
      {processes.flatMap(({ id, windows }) => {
        return windows.map((windowInfo, i) => (
          <div key={`${id}-${i}`}>{windowInfo.render(windowInfo)}</div>
        ));
      })}
    </div>
  );
};

const Desktop = () => {
  return (
    <div className="aspect-[16/10] max-w-[144lvh] min-w-0 max-h-[90lvh] min-h-0 overflow-clip relative">
      <Image src={Wallpaper} alt="desktop wallpaper" draggable={false} />
      <ProcessTableContextProvider>
        <WindowManager />
        <Taskbar />
      </ProcessTableContextProvider>
    </div>
  );
};

export const Computer = () => (
  <div className="w-lvw h-lvh p-10 flex items-center justify-center select-none">
    <Desktop />
  </div>
);
