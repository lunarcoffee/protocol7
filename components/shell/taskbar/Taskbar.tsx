'use client';

import { useProcessManager } from '../../contexts/ProcessManagerContext';
import { Clock } from './Clock';
import { LauncherButton } from './LauncherButton';
import { useToggle } from '@/hooks/useToggle';
import { SystemTray } from './SystemTray';
import NetworkIcon from '@/public/icons/network.svg';
import VolumeHighIcon from '@/public/icons/volume-high.svg';
import Image from 'next/image';
import { useWindowManager } from '@/components/contexts/WindowManagerContext';
import { AnimatePresence, motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { useWindowFocus } from '@/hooks/windows/useWindowFocus';
import { useFocusDesktop } from '@/hooks/useFocusDesktop';

export const Taskbar = () => {
  const [{ processes }] = useProcessManager();
  const [{ windows }] = useWindowManager();

  const taskbarEntries = Array.from(processes.values(), (process) => ({
    process,
    windows: process.windows.map((wid) => windows.get(wid)!),
  }));

  const focusWindow = useWindowFocus();
  const focusDesktop = useFocusDesktop();

  const [isLauncherOpen, toggleLauncherOpen] = useToggle();

  const entryMotionVariants = {
    transitioning: {
      opacity: 0,
      transform: 'scale(0.5)',
      width: 0,
      padding: 0,
    },
    normal: {
      opacity: 1,
      transform: 'scale(1)',
      width: '4rem',
      padding: '0.5rem',
    },
  };

  return (
    <div className="flex flex-row items-center absolute bottom-0 w-full h-10 pl-4 pr-2 bg-gradient-to-t from-aero-tint-dark/80 via-95% via-aero-tint-dark/70 to-white/40 backdrop-blur-xs border-t border-t-aero-tint-darkest/85 z-10">
      <div className="left-4 -mt-1 mr-4">
        <LauncherButton active={isLauncherOpen} onClick={toggleLauncherOpen} />
      </div>
      <div className="flex flex-row gap-1 h-full">
        <AnimatePresence>
          {taskbarEntries.map(({ process, windows }) => {
            const groupIsFocused = windows.find(({ hasFocus }) => hasFocus);
            return (
              <motion.div
                onClick={
                  groupIsFocused
                    ? () => focusDesktop()
                    : () => focusWindow(windows[0].wid)
                }
                className={twMerge(
                  clsx(
                    'flex flex-row items-center relative h-full max-w-16 px-2 rounded-xs bg-radial-[at_100%_100%] from-transparent via-55% via-transparent to-90% to-white/40 ring ring-aero-tint-darkest/80 inset-shadow-[0_0_3px] inset-shadow-white/50 shadow-xs shadow-aero-tint-darkest',
                    groupIsFocused &&
                      'from-aero-tint-dark/70 via-40% via-white/20 to-white/70 inset-shadow-[0_0_6px]',
                  ),
                )}
                key={process.pid}
                initial="transitioning"
                animate="normal"
                exit="transitioning"
                variants={entryMotionVariants}
                transition={{ duration: 0.06 }}
              >
                <p className="text-sm text-nowrap text-ellipsis overflow-hidden">
                  {windows[0].title}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
