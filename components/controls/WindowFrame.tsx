'use client';

import { PropsWithChildren } from 'react';
import { WindowInfo } from '../contexts/WindowManagerContext';
import { useWindowDestroy } from '@/hooks/useWindowDestroy';
import { useWindowMove } from '@/hooks/useWindowMove';

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
    className={`size-4 rounded-full bg-gradient-to-t ${bgFrom} ${bgTo} inset-shadow-sm inset-shadow-black/70 ring ${ring} shadow-sm shadow-white/80 overflow-clip`}
  >
    <div className="relative">
      <div
        className={`absolute w-6 h-3 -ml-1 -mt-1 rounded-full bg-radial ${topGlow} to-50% to-transparent`}
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
  windowInfo: { pid, wid, title, position, size, isOpen },
  children,
}: WindowFrameProps) => {
  const moveWindow = useWindowMove();
  const destroyWindow = useWindowDestroy();

  const onWindowDragStart = (initialX: number, initialY: number) => {
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
    };

    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mouseup', mouseUpListener);
  };

  return (
    <div
      className="flex flex-col absolute p-1 rounded-md bg-gradient-to-b from-aero-tint-dark/70 to-aero-tint-dark/80 backdrop-blur-xs border border-aero-tint-darkest/85 inset-shadow-[0_0_2px] inset-shadow-white/80 text-shadow-md text-shadow-aero-tint-darkest/50 shadow-[0_0_20px] shadow-aero-tint-darkest/75"
      style={{
        top: position.y,
        left: position.x,
        width: size.x,
        height: size.y,
      }}
    >
      <div
        className="flex flex-row items-center px-1"
        onMouseDown={(event) => onWindowDragStart(event.clientX, event.clientY)}
      >
        <p className="pt-px text-sm">{title}</p>
        <div className="grow" />
        <div className="flex flex-row items-center gap-2">
          <WindowControlButton
            bgFrom="from-lime-500"
            bgTo="to-lime-900"
            ring="ring-lime-950"
            topGlow="from-lime-200"
            topShadow="inset-shadow-green-950"
            bottomGlow="from-lime-300"
            onClick={() => destroyWindow(pid, wid)}
          />
          <WindowControlButton
            bgFrom="from-yellow-400"
            bgTo="to-yellow-800"
            ring="ring-yellow-950"
            topGlow="from-yellow-200"
            topShadow="inset-shadow-green-950"
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
      <div className="grow mt-1 bg-gray-200 rounded-sm border border-aero-tint-darkest/85 shadow-[0_0_2px] shadow-white/80">
        {children}
      </div>
    </div>
  );
};
