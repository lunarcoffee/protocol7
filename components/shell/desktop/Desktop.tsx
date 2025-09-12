'use client';

import Image from 'next/image';
import { MouseEvent, useState } from 'react';
import { useImmerReducer } from 'use-immer';

import { useBoolean } from '@/hooks/useBoolean';
import { useProcessManager } from '@/hooks/useProcessManager';
import { useWindowManager } from '@/hooks/useWindowManager';
import Battery from '@/public/icons/battery.svg';
import Wireless from '@/public/icons/wireless.svg';
import Launcher from '@/public/launcher.png';
import Garden from '@/public/pictures/garden.jpg';
import Maple from '@/public/pictures/maple.jpg';
import Wallpaper from '@/public/wallpapers/flowers.avif';
import { Dimensions, toScreenPosition } from '@/utils/Dimensions';
import { doRectanglesIntersect } from '@/utils/doRectanglesIntersect';
import { handleMouseDrag } from '@/utils/handleMouseDrag';

import { WindowFrame } from '../windows/WindowFrame';
import { DesktopIcon } from './DesktopIcon';

export const Desktop = () => {
  const pm = useProcessManager();
  const wm = useWindowManager();

  // TODO: pull from fs once thats implemented
  const iconData = [
    { icon: Maple, label: 'HPIM_3328.jpg' },
    { icon: Garden, label: 'HPIM_3329.jpg' },
    { icon: Battery, label: 'battery indicator.svg' },
    { icon: Wireless, label: 'signal.jpg' },
    { icon: Launcher, label: 'hanyu english字典 translation dictionary.txt' },
  ];

  // TODO: move all this where its supposed to be eventually
  const [icons, updateIcon] = useImmerReducer(
    (draft, { id, value }: { id: number; value: boolean }) => {
      // TODO: currently the id is the index assigned here but change this to be correct once we
      // start pulling icons from the filesystem
      draft[id].isSelected = value;
    },
    iconData.map((icon, index) => ({
      ...icon,
      isSelected: false,
      id: index,
      onSelectionChange: (value: boolean) => {
        updateIcon({ id: index, value });
      },
    })),
  );

  const onDesktopClick = (e: MouseEvent) => {
    wm.unfocusAll();

    // allow desktop item multi-select with ctrl
    if (!e.getModifierState('Control'))
      icons.forEach((_, index) => updateIcon({ id: index, value: false }));
  };

  const [isDragging, startDrag, endDrag] = useBoolean(false);

  const { x: screenLeft, y: screenTop } = toScreenPosition({ x: 0, y: 0 });
  const initialDragRect = {
    top: screenTop,
    left: screenLeft,
    width: 0,
    height: 0,
  };
  const [dragRect, setDragRect] = useState(initialDragRect);

  const onDesktopDragStart = (initialPosition: Dimensions) => {
    const { x, y } = toScreenPosition(initialPosition);

    setDragRect(initialDragRect);
    startDrag();

    handleMouseDrag({
      initialPosition,
      onMove: (dx, dy) => {
        setDragRect({
          top: dy < 0 ? y + dy : y,
          left: dx < 0 ? x + dx : x,
          width: Math.abs(dx),
          height: Math.abs(dy),
        });

        const dragRectElement = document.getElementById('desktop-drag-rect');
        if (!dragRectElement) return;

        icons.forEach(({ id }) => {
          const iconElement = document.getElementById(`desktop-icon-${id}`);
          if (iconElement) {
            updateIcon({
              id,
              value: doRectanglesIntersect(
                dragRectElement.getBoundingClientRect(),
                iconElement.getBoundingClientRect(),
              ),
            });
          }
        });
      },
      onDragEnd: endDrag,
    });
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
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
        {icons.map((icon, i) => (
          <DesktopIcon
            {...icon}
            onLaunch={() => {
              pm.create({ pid: pm.nextProcessID });
              wm.create({
                pid: pm.nextProcessID,
                wid: wm.nextWindowID,
                title: icon.label,
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
          id="desktop-drag-rect"
          className={`
            pointer-events-none absolute border border-aero-tint-highlight/25
            bg-aero-tint-highlight/20
          `}
          style={dragRect}
        />
      )}
    </div>
  );
};
