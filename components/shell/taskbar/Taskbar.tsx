'use client';

import { Clock } from './Clock';
import { LauncherButton } from './LauncherButton';
import { useToggle } from '@/hooks/useToggle';
import { SystemTray } from './SystemTray';
import NetworkIcon from '@/public/icons/network.svg';
import VolumeHighIcon from '@/public/icons/volume-high.svg';
import Image from 'next/image';
import { useWindowManager } from '@/components/contexts/WindowManagerContext';
import { WindowList } from './WindowList';

export const Taskbar = () => {
  const [{ windows }] = useWindowManager();
  const windowArray = Array.from(windows.values());

  const [isLauncherOpen, toggleLauncherOpen] = useToggle();

  return (
    <div className="flex flex-row items-center absolute bottom-0 w-full max-w-full h-10 pl-4 pr-2 bg-gradient-to-t from-aero-tint-dark/80 via-95% via-aero-tint-dark/70 to-white/40 backdrop-blur-xs border-t border-t-aero-tint-darkest/85 z-10">
      <div className="left-4 -mt-1 mr-4">
        <LauncherButton active={isLauncherOpen} onClick={toggleLauncherOpen} />
      </div>
      <div className="flex flex-row items-center min-w-0 grow shrink gap-1.5 h-full">
        <WindowList windows={windowArray} />
      </div>
      <div className="shrink-0 ml-3">
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
      <div className="h-full ml-1 shrink-0">
        <Clock />
      </div>
    </div>
  );
};
