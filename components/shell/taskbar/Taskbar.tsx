'use client';

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
import { useFocusDesktop } from '@/hooks/windows/useFocusDesktop';

export const Taskbar = () => {
  const [{ windows }] = useWindowManager();
  const windowArray = Array.from(windows.values());

  const focusWindow = useWindowFocus();
  const focusDesktop = useFocusDesktop();

  const [isLauncherOpen, toggleLauncherOpen] = useToggle();

  const entryMotionVariants = {
    transition: {
      opacity: 0,
      transform: 'scale(0.5)',
      maxWidth: 0,
      padding: 0,
    },
    normal: {
      opacity: 1,
      transform: 'scale(1)',
      maxWidth: '8rem',
      padding: '0.5rem',
    },
  };

  return (
    <div className="flex flex-row items-center absolute bottom-0 w-full h-10 pl-4 pr-2 bg-gradient-to-t from-aero-tint-dark/80 via-95% via-aero-tint-dark/70 to-white/40 backdrop-blur-xs border-t border-t-aero-tint-darkest/85 z-10">
      <div className="left-4 -mt-1 mr-4">
        <LauncherButton active={isLauncherOpen} onClick={toggleLauncherOpen} />
      </div>
      <div className="flex flex-row items-center w-full shrink gap-1.5 h-full">
        <AnimatePresence>
          {windowArray.map(({ pid, wid, title, hasFocus }) => {
            return (
              <motion.div
                onClick={
                  hasFocus ? () => focusDesktop() : () => focusWindow(wid)
                }
                className={twMerge(
                  clsx(
                    'flex flex-row items-center shrink relative min-w-0 h-8 basis-32 rounded-xs overflow-clip bg-radial-[at_100%_100%] from-transparent via-55% via-transparent to-90% to-white/30 ring ring-aero-tint-darkest/60 inset-shadow-[0_0_3px] inset-shadow-white/30 shadow-xs shadow-aero-tint-darkest group hover:inset-shadow-[0_0_6px] transition-[--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,box-shadow,backdrop-filter] duration-100',
                    (hasFocus &&
                      'from-aero-tint/40 via-white/20 to-white/60 inset-shadow-[0_0_6px] hover:backdrop-brightness-125') ||
                      'hover:from-aero-tint/60 hover:via-aero-tint-dark/80',
                  ),
                )}
                key={pid}
                initial="transition"
                animate="normal"
                exit="transition"
                variants={entryMotionVariants}
                transition={{ duration: 0.06 }}
              >
                <p className="min-w-0 text-xs overflow-ellipsis line-clamp-1 text-shadow-md text-shadow-aero-tint-darkest/50">
                  {title}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="grow"></div>
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
      <div className="h-full ml-1 shrink-0">
        <Clock />
      </div>
    </div>
  );
};
