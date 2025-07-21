'use client';

import { useProcessManager } from '../../contexts/ProcessManagerContext';
import { Clock } from './Clock';
import { LauncherButton } from './LauncherButton';
import { useToggle } from '@/hooks/useToggle';
import { SystemTray } from './SystemTray';

import NetworkIcon from '@/public/icons/network.svg';
import WirelessIcon from '@/public/icons/wireless.svg';
import BatteryIcon from '@/public/icons/battery.svg';
import VolumeHighIcon from '@/public/icons/volume-high.svg';
import Image from 'next/image';

export const Taskbar = () => {
  // const [processInfo, updateProcessInfo] = useProcessTable();
  const [isActive, toggleActive] = useToggle();

  return (
    <div className="absolute bottom-0 w-full h-10 pl-4 pr-2 bg-gradient-to-t from-aero-tint-dark/80 via-95% via-aero-tint-dark/70 to-white/40 backdrop-blur-xs border-t border-t-aero-tint-darkest/85 flex flex-row items-center z-10">
      <div className="left-4 -mt-1">
        <LauncherButton active={isActive} onClick={toggleActive} />
      </div>
      <div className="grow"></div>
      <div className="">
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
            // {
            //   renderIcon: () => (
            //     <Image
            //       src={WirelessIcon}
            //       alt="network icon"
            //       className="w-7 p-[0.4rem]"
            //     />
            //   ),
            //   renderPane: () => <p></p>,
            // },
          ]}
        />
      </div>
      <div className="h-full ml-1">
        <Clock />
      </div>
    </div>
  );
};
