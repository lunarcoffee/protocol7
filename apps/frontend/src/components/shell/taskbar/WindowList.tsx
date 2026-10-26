import { cn } from 'cn';
import { AnimatePresence, motion } from 'motion/react';

import { useProcess } from '@/hooks/processes';
import { useSystemStoreWithEqualityFn } from '@/hooks/system/useSystemStoreWithEqualityFn';
import { useFocusWindow, useMinimizeWindow } from '@/hooks/windows';
import { WID_DESKTOP, WID_LAUNCHER, WID_TASKBAR, type WindowInfo } from '@/stores/system/windows/WindowManager';
import { getSystemIcon } from '@/utils/getSystemIcon';
import { shallowArrayEquals } from '@/utils/shallowArrayEquals';

type WindowListItemProps = Pick<WindowInfo, 'wid' | 'pid' | 'title' | 'hasFocus'>;

const WindowListItem = ({ wid, pid, title, hasFocus }: WindowListItemProps) => {
    const minimizeWindow = useMinimizeWindow();
    const focusWindow = useFocusWindow();
    const settings = useProcess(pid)?.getSettings();

    return (
        <motion.div
            onClick={hasFocus ? () => minimizeWindow(wid) : () => focusWindow(wid)}
            className={cn(
                `
                    relative flex h-8 min-w-0 shrink basis-40 flex-row items-center overflow-clip rounded-xs
                    bg-radial-[at_100%_100%] from-transparent via-transparent via-55% to-white/30 to-90%
                    shadow-xs inset-shadow-[0_0_3px] shadow-aero-tint-darkest inset-shadow-white/30 outline
                    outline-aero-tint-darkest/60 transition-[--tw-gradient-from,--tw-gradient-to,box-shadow]
                    duration-75
                    *:transition *:duration-75
                `,
                hasFocus
                    ? `
                        from-aero-tint/80 via-white/10 to-white/60 inset-shadow-[0_0_8px]
                        *:brightness-100 *:grayscale-0
                        hover:from-aero-tint hover:to-white/70 hover:inset-shadow-white/40
                    `
                    : `
                        *:brightness-75 *:grayscale-50
                        hover:from-aero-tint/40 hover:to-aero-tint-highlight/60 hover:inset-shadow-[0_0_5px]
                        hover:*:brightness-100 hover:*:grayscale-0
                    `,
            )}
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
            transition={{ duration: 0.08 }}
        >
            <img
                src={getSystemIcon(settings?.icon || '')}
                width={20}
                className="mr-0.5 -ml-px drop-shadow-xs drop-shadow-aero-tint-darkest/50"
            />
            <p
                className={`
                    overflow-hidden p-1 text-xs text-nowrap text-ellipsis text-shadow-aero-tint-darkest/50
                    text-shadow-md
                `}
            >
                {title}
            </p>
        </motion.div>
    );
};

// IDs of windows which should not appear in the window list
export const HIDDEN_WIDS = [WID_DESKTOP, WID_TASKBAR, WID_LAUNCHER];

export interface WindowListProps {
    windows: WindowInfo[];
}

export const WindowList = () => {
    // only show non-ephemeral and non-hidden (see `HIDDEN_WIDS` above) windows
    const listableWindows = useSystemStoreWithEqualityFn(
        ({ wm: { windows } }) =>
            Array.from(windows.values())
                .filter(({ wid, isEphemeral }) => !(isEphemeral || HIDDEN_WIDS.includes(wid)))
                .map(({ wid, pid, title, hasFocus }) => ({ wid, pid, title, hasFocus })),
        shallowArrayEquals,
    );

    return (
        <AnimatePresence>
            {Array.from(listableWindows, (props) => (
                <WindowListItem key={props.wid} {...props} />
            ))}
        </AnimatePresence>
    );
};
