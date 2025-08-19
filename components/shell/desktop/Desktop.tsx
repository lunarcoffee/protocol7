'use client';

import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import { useImmerReducer } from 'use-immer';

import { Dimensions } from '@/components/contexts/system/WindowManager';
import { useNextProcessID, useProcessCreate } from '@/hooks/processes';
import { useBoolean } from '@/hooks/useBoolean';
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
import Wallpaper from '@/public/wallpapers/torontoold.jpg';
import { handleMouseDrag } from '@/utils/handleMouseDrag';
import { toScreenPosition } from '@/utils/toScreenPosition';

import { WindowFrame } from '../windows/WindowFrame';
import { DesktopIcon } from './DesktopIcon';

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

  const onDesktopClick = (e: MouseEvent) => {
    focusDesktop();

    // allow desktop item multi-select with ctrl
    if (!e.getModifierState('Control'))
      icons.forEach((_, index) => updateIcon({ index, value: false }));
  };

  const [isDragging, startDrag, endDrag] = useBoolean(false);

  const initialDragRect = { top: 0, left: 0, width: 0, height: 0 };
  const [dragRect, setDragRect] = useState(initialDragRect);

  const onDesktopDragStart = (initialPosition: Dimensions) => {
    startDrag();
    setDragRect(initialDragRect);

    handleMouseDrag({
      initialPosition,
      onMove: (dx, dy) => {
        const { x, y } = toScreenPosition(initialPosition);
        return setDragRect({
          top: dy < 0 ? y + dy : y,
          left: dx < 0 ? x + dx : x,
          width: Math.abs(dx),
          height: Math.abs(dy),
        });
      },
      onDragEnd: endDrag,
    });
  };

  return (
    <div className="relative size-full">
      <Image
        src={Wallpaper}
        alt="desktop wallpaper"
        draggable={false}
        priority
        className="absolute size-full object-cover object-center"
        unoptimized
      />
      <div
        onMouseDownCapture={onDesktopClick}
        onMouseDown={(event) =>
          onDesktopDragStart({ x: event.clientX, y: event.clientY })
        }
        className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
      >
        {icons.map((props, i) => (
          <DesktopIcon
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
      {isDragging && (
        <div
          className={`
            absolute border border-aero-tint-highlight/25
            bg-aero-tint-highlight/20
          `}
          style={dragRect}
        />
      )}
    </div>
  );
};
