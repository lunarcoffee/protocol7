'use client';

import Image from 'next/image';

import { useWindowManager } from '@/hooks/windows/useWindowManager';
import NetworkIcon from '@/public/icons/network.svg';
import VolumeHighIcon from '@/public/icons/volume-high.svg';

import { Clock } from './Clock';
import { LauncherButton } from './LauncherButton';
import { SystemTray } from './SystemTray';
import { WindowList } from './WindowList';

export const Taskbar = () => {
  const [{ windows }] = useWindowManager();
  const windowArray = Array.from(windows.values());

  return (
    <div
      className={`
        absolute bottom-0 z-[calc(infinity)] flex h-10 w-full max-w-full
        flex-row items-center border-t border-t-aero-tint-darkest/85
        bg-gradient-to-t from-aero-tint-dark/80 to-aero-tint-dark/70
        backdrop-blur-xs
      `}
    >
      {/* white top highlight */}
      <div
        className={`
          absolute top-0 left-0 z-20 h-0.5 w-full bg-gradient-to-b from-white/30
        `}
      />
      {/* darkened background over launcher button */}
      <div
        className={`
          flex h-full items-center bg-gradient-to-r from-aero-tint-darkest/15
          via-aero-tint-darkest/20 via-[calc(100%-1.5rem] pr-5 pl-4
        `}
      >
        <div className="left-4 z-30 -mt-1 mr-4">
          <LauncherButton />
        </div>
      </div>
      <div
        className={`
          z-10 -mx-5 flex h-full min-w-0 shrink grow flex-row items-center
          gap-1.5
        `}
      >
        <WindowList windows={windowArray} />
      </div>
      {/* darkened background over tray and clock */}
      <div
        className={`
          flex h-full flex-row items-center bg-gradient-to-l
          from-aero-tint-darkest/15 via-aero-tint-darkest/20
          via-[calc(100%-1.5rem)] pr-2 pl-5
        `}
      >
        <div className="ml-3 shrink-0">
          {/* TODO: eventually this module should be attached to a global network manager state thing */}
          <SystemTray
            items={[
              {
                renderIcon: () => (
                  <Image
                    src={VolumeHighIcon}
                    alt="network icon"
                    className="w-7 p-[0.27rem]"
                  />
                ),
                renderPane: () => <p></p>,
              },
              {
                renderIcon: () => (
                  <Image
                    src={NetworkIcon}
                    alt="network icon"
                    className="w-7 p-[0.4rem]"
                  />
                ),
                renderPane: () => <p></p>,
              },
            ]}
          />
        </div>
        <div className="z-30 ml-1 h-full shrink-0">
          <Clock />
        </div>
      </div>
    </div>
  );
};
