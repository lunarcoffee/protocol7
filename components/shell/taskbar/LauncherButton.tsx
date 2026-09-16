import { useFile } from '@/hooks/filesystem/useFile';
import { useCreateWindow, useDestroyWindow, useWindow } from '@/hooks/windows';
import { PID_SHELL } from '@/stores/system/processes/ProcessManager';
import { WID_LAUNCHER } from '@/stores/system/windows/WindowManager';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { Launcher } from './Launcher';

const ReflectiveOrb = ({ active }: { active: boolean }) => (
    <>
        {/* upper reflection */}
        <div
            className={twMergeClsx(
                `
                    absolute z-10 h-7 w-12 rounded-t-3xl rounded-b-sm bg-linear-to-b from-white/40 to-white/5
                    inset-shadow-sm inset-shadow-white/40 transition duration-100
                    group-hover:from-white/50 group-hover:inset-shadow-white/60
                `,
                active && 'inset-shadow-white/50',
            )}
        />
        {/* manual mask to round out the bottom */}
        <div
            className={`
                absolute z-20 mt-[1.62rem] h-2 w-10 rounded-[50%] bg-linear-to-b from-aero-tint-dark from-40%
                to-transparent to-40%
            `}
        />
        {/* lower half glow */}
        <div
            className={twMergeClsx(
                `
                    absolute z-30 size-12 rounded-full bg-radial-[at_50%_100%] from-aero-tint to-transparent
                    to-50% transition duration-100
                    group-hover:from-aero-tint-highlight/40
                `,
                active &&
                    `
                        from-aero-tint-highlight/60
                        group-hover:from-aero-tint-highlight/60
                    `,
            )}
        />
    </>
);

const LauncherIcon = ({ active }: { active: boolean }) => {
    const [file] = useFile('/system/icons/launcher.png');
    if (!file?.ok) return null;

    return (
        <img
            src={file.objectURL}
            alt="launcher icon"
            draggable={false}
            className={twMergeClsx(
                `
                    absolute z-30 mt-1 size-10 opacity-70 drop-shadow-[0_0_0] drop-shadow-transparent
                    transition duration-100
                    group-hover:opacity-100 group-hover:drop-shadow-[0_0_2px] group-hover:drop-shadow-white/50
                `,
                active && 'opacity-90 drop-shadow-[0_0_1px] drop-shadow-white/30',
            )}
        />
    );
};

export const LauncherButton = () => {
    const launcherWindow = useWindow(WID_LAUNCHER);
    const createWindow = useCreateWindow();
    const destroyWindow = useDestroyWindow();
    const isLauncherOpen = launcherWindow !== undefined;

    const toggleLauncher = () => {
        if (isLauncherOpen) {
            destroyWindow(WID_LAUNCHER);
        } else {
            createWindow({
                pid: PID_SHELL,
                wid: WID_LAUNCHER,
                title: 'Launcher',
                isEphemeral: true,
                render: (windowInfo) => <Launcher windowInfo={windowInfo} />,
            });
        }
    };

    return (
        <div
            className={twMergeClsx(
                `
                    group z-0 flex size-12 cursor-pointer flex-row justify-center rounded-full
                    bg-aero-tint-dark shadow-[0_0_0.3rem] ring shadow-white/60 ring-aero-tint-darkest
                    transition duration-100
                    hover:shadow-[0_0_0.5rem] hover:shadow-white/70
                `,
                isLauncherOpen &&
                    `
                        shadow-[0_0_0.4rem] shadow-white/70
                        hover:shadow-white/80
                    `,
            )}
            onClick={toggleLauncher}
        >
            <ReflectiveOrb active={isLauncherOpen} />
            <LauncherIcon active={isLauncherOpen} />
        </div>
    );
};
