import { AnimatePresence, motion } from 'motion/react';

import {
  WID_DESKTOP,
  WID_LAUNCHER,
  WID_TASKBAR,
  WindowInfo,
} from '@/components/contexts/system/windows/WindowManager';
import { useWindowManager } from '@/hooks/useWindowManager';
import { twMergeClsx } from '@/utils/twMergeClsx';

// IDs of windows which should not appear in the window list
export const HIDDEN_WIDS = [WID_DESKTOP, WID_TASKBAR, WID_LAUNCHER];

export interface WindowListProps {
  windows: WindowInfo[];
}

export const WindowList = () => {
  const wm = useWindowManager();

  const visibleWindows = wm.windows
    .values()
    .filter(
      ({ wid, isEphemeral }) => !(isEphemeral || HIDDEN_WIDS.includes(wid)),
    );

  return (
    <AnimatePresence>
      {Array.from(visibleWindows, ({ wid, title, hasFocus }) => (
        <motion.div
          onClick={hasFocus ? () => wm.minimize(wid) : () => wm.focus(wid)}
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
            hasFocus
              ? `
                from-aero-tint/40 via-white/20 to-white/60
                inset-shadow-[0_0_6px]
                hover:backdrop-brightness-125
              `
              : 'hover:from-aero-tint/60 hover:via-aero-tint-dark/80',
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
              -ml-1 overflow-hidden p-1 text-xs text-nowrap overflow-ellipsis
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
