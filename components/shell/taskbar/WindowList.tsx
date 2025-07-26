import { WindowInfo } from '@/components/contexts/WindowManagerContext';
import { useWindowFocus } from '@/hooks/windows/useWindowFocus';
import { useWindowMinimize } from '@/hooks/windows/useWindowMinimize';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';

export interface WindowListProps {
  windows: WindowInfo[];
}

export const WindowList = ({ windows }: WindowListProps) => {
  const focusWindow = useWindowFocus();
  const minimizeWindow = useWindowMinimize();

  return (
    <AnimatePresence>
      {windows.map(({ pid, wid, title, hasFocus }) => {
        return (
          <motion.div
            onClick={
              hasFocus ? () => minimizeWindow(wid) : () => focusWindow(wid)
            }
            className={twMerge(
              clsx(
                'flex flex-row items-center basis-32 shrink relative min-w-0 h-8 rounded-xs overflow-clip bg-radial-[at_100%_100%] from-transparent via-55% via-transparent to-90% to-white/30 ring ring-aero-tint-darkest/60 inset-shadow-[0_0_3px] inset-shadow-white/30 shadow-xs shadow-aero-tint-darkest group hover:inset-shadow-[0_0_6px] transition-[--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,box-shadow,backdrop-filter] duration-100',
                (hasFocus &&
                  'from-aero-tint/40 via-white/20 to-white/60 inset-shadow-[0_0_6px] hover:backdrop-brightness-125') ||
                  'hover:from-aero-tint/60 hover:via-aero-tint-dark/80',
              ),
            )}
            key={pid}
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
                maxWidth: '8rem',
                padding: '0.5rem',
              },
            }}
            initial="transition"
            animate="normal"
            exit="transition"
            transition={{ duration: 0.06 }}
          >
            <p className="text-xs overflow-ellipsis text-nowrap overflow-hidden text-shadow-md text-shadow-aero-tint-darkest/50">
              {title}
            </p>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};
