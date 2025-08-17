'use client';

import Image from 'next/image';

import { useToggle } from '@/hooks/useToggle';
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

  const [isLauncherOpen, toggleLauncherOpen] = useToggle();

  return (
    <div
      className={`
        absolute bottom-0 z-[calc(infinity)] flex h-10 w-full max-w-full
        flex-row items-center border-t border-t-aero-tint-darkest/85
        bg-gradient-to-t from-aero-tint-dark/80 via-aero-tint-dark/70 via-95%
        to-white/40 pr-2 pl-4 backdrop-blur-xs
      `}
    >
      <div className="left-4 -mt-1 mr-4">
        <LauncherButton active={isLauncherOpen} onClick={toggleLauncherOpen} />
      </div>
      <div
        className={`
          flex h-full min-w-0 shrink grow flex-row items-center gap-1.5
        `}
      >
        <WindowList windows={windowArray} />
      </div>
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
      <div className="ml-1 h-full shrink-0">
        <Clock />
      </div>
    </div>
  );
};
