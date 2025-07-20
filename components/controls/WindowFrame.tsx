'use client';

import { PropsWithChildren, useState } from 'react';
import {
  ProcessID,
  useProcessTable,
  WindowInfo,
} from '../contexts/ProcessInfoContext';

export interface WindowFrameProps extends PropsWithChildren {
  windowInfo: WindowInfo;
  pid: ProcessID;
  index: number;
  maximizable?: boolean;
  // TODO: do we even need this here? what if this goes in processinfo? or eventually when we have
  // multiple windows the window info
}

export const WindowFrame = ({
  windowInfo: { title, position, size, isOpen },
  pid,
  index,
  maximizable = true,
  children,
}: WindowFrameProps) => {
  const [processInfo, updateProcessInfo] = useProcessTable();

  const onWindowDragStart = (initialX: number, initialY: number) => {
    const mouseMoveListener = (rawEvent: Event) => {
      const event = rawEvent as MouseEvent;
      const deltaX = event.screenX - initialX;
      const deltaY = event.screenY - initialY;

      const currentPosition = processInfo.get(pid)?.windows?.[index]?.position;
      if (!currentPosition) return; // TODO: highkey this should never happen

      updateProcessInfo({
        action: 'window',
        pid,
        subaction: {
          action: 'move',
          index,
          position: {
            x: currentPosition.x + deltaX,
            y: currentPosition.y + deltaY,
          },
        },
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
      className="flex flex-col absolute p-1 rounded-md bg-gradient-to-b from-aero-tint-dark/80 to-aero-tint-dark/70 backdrop-blur-xs border border-aero-tint-darkest/85 inset-shadow-[0_0_2px] inset-shadow-white/80 text-shadow-md text-shadow-aero-tint-darkest/50 shadow-[0_0_20px] shadow-aero-tint-darkest/75"
      style={{
        top: position.y,
        left: position.x,
        width: size.x,
        height: size.y,
      }}
    >
      <div
        className="flex flex-row items-center px-1"
        onMouseDown={(event) => {
          onWindowDragStart(event.screenX, event.screenY);
        }}
      >
        <p className="pt-px text-sm">{title}</p>
        <div className="grow" />
        <div className="flex flex-row items-center gap-2">
          <div className="size-4 rounded-full bg-gradient-to-b from-green-500 to-green-900 inset-shadow-xs inset-shadow-white/70 ring ring-green-950 shadow-sm shadow-aero-tint-darkest/70"></div>
          <div className="size-4 rounded-full bg-gradient-to-b from-yellow-500 to-yellow-900 inset-shadow-xs inset-shadow-white/70 ring ring-yellow-950 shadow-sm shadow-aero-tint-darkest/70"></div>
          <div
            onClick={() =>
              updateProcessInfo({
                action: 'window',
                pid,
                subaction: { action: 'destroy', index },
              })
            }
            className="size-4 rounded-full bg-gradient-to-b from-red-500 to-red-900 inset-shadow-xs inset-shadow-white/70 ring ring-red-950 shadow-sm shadow-aero-tint-darkest/70"
          >
            <div className=""></div>
          </div>
        </div>
      </div>
      <div className="grow mt-1 bg-gray-200 rounded-sm border border-aero-tint-darkest/85 shadow-[0_0_2px] shadow-white/80">
        {children}
      </div>
    </div>
  );
};
