import { PropsWithChildren } from 'react';
import { WindowInfo } from '../contexts/ProcessInfoContext';

export interface WindowFrameProps extends PropsWithChildren {
  windowInfo: WindowInfo;
  maximizable?: boolean;
  // TODO: do we even need this here? what if this goes in processinfo? or eventually when we have
  // multiple windows the window info
}

export const WindowFrame = ({
  windowInfo: { title, position, size, isOpen },
  maximizable = true,
  children,
}: WindowFrameProps) => {
  return (
    <div
      className="flex flex-col absolute p-1 rounded-md bg-gradient-to-b from-aero-tint-dark/80 to-aero-tint-dark/70 backdrop-blur-xs border border-aero-tint-darkest/85 inset-shadow-[0_0_2px] inset-shadow-white/80 text-shadow-md text-shadow-aero-tint-darkest/50"
      style={{
        top: position.y,
        left: position.x,
        width: size.x,
        height: size.y,
      }}
    >
      <div className="flex flex-row items-center">
        <p className="pt-px text-sm">{title}</p>
        <div className="grow" />
        <div className="flex flex-row items-center gap-1.5 pr-px">
          <div className="size-4 rounded-full bg-gradient-to-b from-green-500 to-green-900 inset-shadow-xs inset-shadow-white/70 ring ring-green-950 shadow-sm shadow-aero-tint-darkest/70"></div>
          <div className="size-4 rounded-full bg-gradient-to-b from-yellow-500 to-yellow-900 inset-shadow-xs inset-shadow-white/70 ring ring-yellow-950 shadow-sm shadow-aero-tint-darkest/70"></div>
          <div className="size-4 rounded-full bg-gradient-to-b from-red-500 to-red-900 inset-shadow-xs inset-shadow-white/70 ring ring-red-950 shadow-sm shadow-aero-tint-darkest/70">
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
