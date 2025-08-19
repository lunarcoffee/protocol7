'use client';

import Image from 'next/image';
import { MouseEvent } from 'react';
import { useImmerReducer } from 'use-immer';

import { useNextProcessID, useProcessCreate } from '@/hooks/processes';
import {
  useFocusDesktop,
  useNextWindowID,
  useWindowCreate,
} from '@/hooks/windows';
import Battery from '@/public/icons/battery.svg';
import Wireless from '@/public/icons/wireless.svg';
import Launcher from '@/public/launcher.png';
import Garden from '@/public/wallpapers/garden.jpg';
import Maple from '@/public/wallpapers/maple.jpg';
import Wallpaper from '@/public/wallpapers/toronto.jpg';

import { WindowFrame } from '../windows/WindowFrame';
import { Icon } from './Icon';

export const Desktop = () => {
  const focusDesktop = useFocusDesktop();

  // TODO: pull from fs once thats implemented
  const iconData = [
    { icon: Maple, label: 'HPIM_3328.jpg' },
    { icon: Garden, label: 'HPIM_3329.jpg' },
    { icon: Battery, label: 'battery indicator.svg' },
    { icon: Wireless, label: 'signal.jpg' },
    { icon: Launcher, label: 'hanyu english字典 translation dictionary.txt' },
  ];

  // TODO: move all this where its supposed to be eventually
  const createProcess = useProcessCreate();
  const createWindow = useWindowCreate();

  const nextPid = useNextProcessID();
  const nextWid = useNextWindowID();

  const [icons, updateIcon] = useImmerReducer(
    (draft, { index, value }: { index: number; value: boolean }) => {
      draft[index].isSelected = value;
    },
    iconData.map((icon, index) => ({
      ...icon,
      isSelected: false,
      onSelectionChange: (value: boolean) => {
        updateIcon({ index, value });
      },
    })),
  );

  const onClickDesktop = (e: MouseEvent) => {
    focusDesktop();

    // allow desktop item multi-select with ctrl
    if (!e.getModifierState('Control'))
      icons.forEach((_, index) => updateIcon({ index, value: false }));
  };

  return (
    <div className="relative size-full">
      <Image
        src={Wallpaper}
        alt="desktop wallpaper"
        draggable={false}
        priority
        className="absolute size-full object-cover object-center"
      />
      <div
        onMouseDownCapture={onClickDesktop}
        className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
      >
        {icons.map((props, i) => (
          <Icon
            {...props}
            onLaunch={() => {
              createProcess({ pid: nextPid });
              createWindow({
                pid: nextPid,
                wid: nextWid,
                title: 'New window',
                size: { x: 800, y: 500 },
                render: (windowInfo) => (
                  <WindowFrame windowInfo={windowInfo}>
                    <div className="size-full bg-gray-100 p-4">
                      <p className="text-sm text-blue-900 text-shadow-none">
                        this is a window!
                      </p>
                    </div>
                  </WindowFrame>
                ),
              });
            }}
            key={i}
          />
        ))}
      </div>
    </div>
  );
};
