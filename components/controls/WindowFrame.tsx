'use client';

import { PropsWithChildren } from 'react';
import { WindowInfo } from '../contexts/WindowManagerContext';
import { useWindowDestroy } from '@/hooks/useWindowDestroy';
import { useWindowMove } from '@/hooks/useWindowMove';
import { useWindowFocus } from '@/hooks/useWindowFocus';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { useWindowResize } from '@/hooks/useWindowResize';

export interface WindowFrameProps extends PropsWithChildren {
  windowInfo: WindowInfo;
}

interface WindowControlButtonProps {
  bgFrom: string;
  bgTo: string;
  ring: string;
  topGlow: string;
  topShadow: string;
  bottomGlow: string;
  onClick: () => void;
}

const WindowControlButton = ({
  bgFrom,
  bgTo,
  ring,
  topGlow,
  topShadow,
  bottomGlow,
  onClick,
}: WindowControlButtonProps) => (
  <div
    onClick={onClick}
    // prevent dragging a window by the buttons
    onMouseDown={(event) => event.stopPropagation()}
    className={`size-4 rounded-full bg-gradient-to-t ${bgFrom} ${bgTo} inset-shadow-sm inset-shadow-black/70 ring ${ring} shadow-sm shadow-white/80 overflow-clip group hover:brightness-125 hover:shadow-white transition duration-75`}
  >
    <div className="relative">
      <div
        className={`absolute w-6 h-3 -ml-1 -mt-1 rounded-full bg-radial ${topGlow} to-50% to-transparent group-hover:brightness-125 transition duration-75`}
      ></div>
      <div
        className={`absolute size-4 rounded-full inset-shadow-[0_1px_2px] ${topShadow}`}
      ></div>
      <div
        className={`absolute w-4 h-4 mt-2 rounded-full bg-radial ${bottomGlow} to-70% to-transparent`}
      ></div>
    </div>
  </div>
);

export const WindowFrame = ({
  windowInfo: { pid, wid, title, position, size, zIndex, hasFocus },
  children,
}: WindowFrameProps) => {
  const destroyWindow = useWindowDestroy();
  const moveWindow = useWindowMove();
  const resizeWindow = useWindowResize();
  const focusWindow = useWindowFocus();

  const onWindowGainsFocus = () => focusWindow(wid);

  const onWindowDragStart = (initialX: number, initialY: number) => {
    document.body.style.cursor = 'move';

    const mouseMoveListener = (rawEvent: Event) => {
      const event = rawEvent as MouseEvent;
      const deltaX = event.clientX - initialX;
      const deltaY = event.clientY - initialY;

      moveWindow(wid, {
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
    };
    const mouseUpListener = () => {
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);

      document.body.style.cursor = 'unset';
    };

    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mouseup', mouseUpListener);
  };

  const onWindowResizeStart = (
    initialX: number,
    initialY: number,
    xMul: number,
    yMul: number,
    shiftX: boolean,
    shiftY: boolean,
    cursor: string,
  ) => {
    document.body.style.cursor = cursor;

    const mouseMoveListener = (rawEvent: Event) => {
      const event = rawEvent as MouseEvent;
      const deltaX = event.clientX - initialX;
      const deltaY = event.clientY - initialY;

      resizeWindow(
        wid,
        {
          x: size.x + deltaX * xMul,
          y: size.y + deltaY * yMul,
        },
        shiftX,
        shiftY,
      );
    };
    const mouseUpListener = () => {
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);

      document.body.style.cursor = 'unset';
    };

    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mouseup', mouseUpListener);
  };

  const resizeHandles: [string, number, number, boolean, boolean, string][] = [
    // top, right, bottom, left
    ['-top-0.5 left-0 w-full h-1', 0, -1, false, true, 'n-resize'],
    ['-right-0.5 top-0 w-1 h-full', 1, 0, false, false, 'e-resize'],
    ['-bottom-0.5 left-0 w-full h-1', 0, 1, false, false, 's-resize'],
    ['-left-0.5 top-0 w-1 h-full', -1, 0, true, false, 'w-resize'],
    // top left, top right, bottom right, bottom left
    ['-top-0.5 -left-0.5 size-3', -1, -1, true, true, 'nwse-resize'],
    ['-top-0.5 -right-0.5 size-3', 1, -1, false, true, 'nesw-resize'],
    ['-bottom-0.5 -right-0.5 size-3', 1, 1, false, false, 'nwse-resize'],
    ['-bottom-0.5 -left-0.5 size-3', -1, 1, true, false, 'nesw-resize'],
  ];

  const mainFrameStyles = twMerge(
    clsx(
      'flex flex-col absolute px-1 pb-1 rounded-md bg-gradient-to-tr from-aero-tint-dark/70 to-aero-tint/70 backdrop-blur-xs border border-aero-tint-darkest/85 inset-shadow-[0_0_2px] inset-shadow-white/80 text-shadow-md text-shadow-aero-tint-darkest/50 shadow-[0_0_20px] shadow-aero-tint-darkest/75',
      !hasFocus &&
        'from-aero-tint-dark/50 to-aero-tint-dark/50 border-aero-tint-darkest/70 shadow-aero-tint-darkest/40',
    ),
  );
  const titleBarStyles = twMerge(
    clsx(
      'flex flex-row max-width-[100%] items-center p-1',
      !hasFocus && 'brightness-75 grayscale-50',
    ),
  );

  return (
    <div
      onMouseDown={onWindowGainsFocus}
      className={mainFrameStyles}
      style={{
        top: position.y,
        left: position.x,
        width: size.x,
        height: size.y,
        zIndex,
      }}
    >
      <div
        onMouseDown={(event) => onWindowDragStart(event.clientX, event.clientY)}
        className={titleBarStyles}
      >
        <p className="shrink min-width-0 pt-px mr-4 text-sm overflow-hidden text-ellipsis text-nowrap">
          {title}
        </p>
        <div className="grow" />
        <div className="flex flex-row items-center gap-2">
          <WindowControlButton
            bgFrom="from-lime-500"
            bgTo="to-lime-900"
            ring="ring-lime-950"
            topGlow="from-lime-200"
            topShadow="inset-shadow-lime-950"
            bottomGlow="from-lime-300"
            onClick={() => destroyWindow(pid, wid)}
          />
          <WindowControlButton
            bgFrom="from-yellow-400"
            bgTo="to-yellow-800"
            ring="ring-yellow-950"
            topGlow="from-yellow-200"
            topShadow="inset-shadow-yellow-950"
            bottomGlow="from-yellow-300"
            onClick={() => destroyWindow(pid, wid)}
          />
          <WindowControlButton
            bgFrom="from-red-500"
            bgTo="to-red-900"
            ring="ring-red-950"
            topGlow="from-red-200"
            topShadow="inset-shadow-red-950"
            bottomGlow="from-red-300"
            onClick={() => destroyWindow(pid, wid)}
          />
        </div>
      </div>
      {resizeHandles.map(([style, ...args]) => (
        <div
          onMouseDown={(event) =>
            onWindowResizeStart(event.clientX, event.clientY, ...args)
          }
          className={`absolute ${style}`}
          style={{ cursor: args[4] }}
          key={style}
        />
      ))}
      <div className="grow bg-gray-200 rounded-sm border border-aero-tint-darkest/85 shadow-[0_0_2px] shadow-white/80">
        {children}
      </div>
    </div>
  );
};
