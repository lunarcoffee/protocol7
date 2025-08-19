import { AnimatePresence, motion } from 'motion/react';

import { WindowInfo } from '@/components/contexts/system/WindowManager';
import { useWindowFocus, useWindowMinimize } from '@/hooks/windows';
import { twMergeClsx } from '@/utils/twMergeClsx';

export interface WindowListProps {
  windows: WindowInfo[];
}

export const WindowList = ({ windows }: WindowListProps) => {
  const focusWindow = useWindowFocus();
  const minimizeWindow = useWindowMinimize();

  const nonEphemeralWindows = windows.filter(({ isEphemeral }) => !isEphemeral);

  return (
    <AnimatePresence>
      {nonEphemeralWindows.map(({ wid, title, hasFocus }) => (
        <motion.div
          onClick={
            hasFocus ? () => minimizeWindow(wid) : () => focusWindow(wid)
          }
          className={twMergeClsx(
            `
              relative flex h-8 min-w-0 shrink basis-40 flex-row items-center
              overflow-clip rounded-xs bg-radial-[at_100%_100%] from-transparent
              via-transparent via-55% to-white/30 to-90% shadow-xs ring
              inset-shadow-[0_0_3px] shadow-aero-tint-darkest
              ring-aero-tint-darkest/60 inset-shadow-white/30
              transition-[--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,box-shadow,backdrop-filter]
              duration-75
              hover:inset-shadow-[0_0_6px]
            `,
            (hasFocus &&
              'from-aero-tint/40 via-white/20 to-white/60 inset-shadow-[0_0_6px] hover:backdrop-brightness-125') ||
              'hover:from-aero-tint/60 hover:via-aero-tint-dark/80',
          )}
          key={wid}
          variants={{
            transition: {
              opacity: 0,
              transform: 'scale(0.5)',
              maxWidth: 0,
              padding: 0,
            },
            normal: {
              opacity: 1,
              transform: 'scale(1)',
              maxWidth: '10rem',
              padding: '0.5rem',
            },
          }}
          initial="transition"
          animate="normal"
          exit="transition"
          transition={{ duration: 0.06 }}
        >
          <p
            className={`
              overflow-hidden text-xs text-nowrap overflow-ellipsis
              text-shadow-aero-tint-darkest/50 text-shadow-md
            `}
          >
            {title}
          </p>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
