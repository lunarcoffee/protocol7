'use client';

import Image from 'next/image';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useImmerReducer } from 'use-immer';

import { PropsWithWindowInfo } from '@/components/contexts/system/windows/WindowManager';
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

export const Desktop = ({
  windowInfo: { wid, hasFocus },
}: PropsWithWindowInfo) => {
  const pm = useProcessManager();
  const wm = useWindowManager();

  // TODO: pull from fs once thats implemented
  const iconData = new Map([
    ['1.desktop', { icon: Maple, label: 'HPIM_3328.jpg' }],
    ['2.desktop', { icon: Garden, label: 'HPIM_3329.jpg' }],
    ['3.desktop', { icon: Battery, label: 'battery indicator.svg' }],
    ['4.desktop', { icon: Wireless, label: 'signal.jpg' }],
    [
      '5.desktop',
      { icon: Launcher, label: 'hanyu english字典 translation dictionary.txt' },
    ],
  ]);

  // in the latest mouseDown event, was an icon clicked or just the desktop? this value informs the
  // behavior of mouseDown handlers so they can implement icon selection properly
  const wasIconClicked = useRef(false);

  const initialIconStates = new Map(
    [...iconData].map(([id, icon]) => [
      id,
      {
        ...icon,
        isSelected: false,
        onClick: (event: MouseEvent) => {
          // clicking an icon in multi-select mode (holding control) toggles the selection state;
          // otherwise, it is always set to true
          const isMultiSelect = event.getModifierState('Control');
          if (!isMultiSelect) deselectAllIcons();
          updateIcon({ id, value: !isMultiSelect || 'toggle' });

          wasIconClicked.current = true;
        },
      },
    ]),
  );

  type UpdateIconAction = { id: string; value: boolean | 'toggle' };

  const [icons, updateIcon] = useImmerReducer(
    (draft, { id, value }: UpdateIconAction) => {
      const icon = draft.get(id);
      if (icon) icon.isSelected = value === 'toggle' ? !icon.isSelected : value;
    },
    initialIconStates,
  );

  const deselectAllIcons = useCallback(
    () => icons.forEach((_, id) => updateIcon({ id, value: false })),
    // `updateIcon` is a reducer dispatch and is referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [icons],
  );

  // deselect icons on losing focus
  useEffect(() => {
    if (!hasFocus) deselectAllIcons();
  }, [hasFocus, deselectAllIcons]);

  const [isDragging, startDrag, endDrag] = useBoolean(false);
  const [dragRect, setDragRect] = useState({});

  const onDesktopDragStart = (initialPosition: Dimensions) => {
    const { x, y } = toScreenPosition(initialPosition);

    handleMouseDrag({
      initialPosition,
      onMove: (dx, dy) => {
        setDragRect({
          top: dy < 0 ? y + dy : y,
          left: dx < 0 ? x + dx : x,
          width: Math.abs(dx),
          height: Math.abs(dy),
        });

        // only call this after moving to avoid drawing a rectangle if the user ends up only
        // clicking instead of dragging
        startDrag();

        const dragRectElement = document.getElementById('desktop-drag-rect');
        if (!dragRectElement) return;

        // select all icons which intersect the drag rectangle and deselect all others
        icons.forEach((_, id) => {
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
    <div
      className="absolute top-0 right-0 bottom-0 left-0 z-0"
      onMouseDownCapture={() => {
        wm.focus(wid);

        // reset for the new click event; this happens in the capturing stage so it comes before
        // other reads/writes
        wasIconClicked.current = false;
      }}
    >
      <Image
        src={Wallpaper}
        alt="desktop wallpaper"
        draggable={false}
        priority
        className="absolute size-full object-cover object-center"
        unoptimized
      />
      <div
        onMouseDown={(event) => {
          // clicks directly on the desktop should always deselect icons and prepare for dragging
          if (!wasIconClicked.current) {
            deselectAllIcons();
            onDesktopDragStart({ x: event.clientX, y: event.clientY });
          }
        }}
        className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
      >
        {Array.from(icons.entries(), ([id, icon]) => (
          <DesktopIcon
            {...icon}
            id={id}
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
            key={id}
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
