import Image from 'next/image';

import { PID_SHELL } from '@/components/contexts/system/ProcessManager';
import { useProcessManager } from '@/hooks/processes/useProcessManager';
import { useNextWindowID } from '@/hooks/windows/useNextWindowID';
import { useWindowCreate } from '@/hooks/windows/useWindowCreate';
import { useWindowDestroy } from '@/hooks/windows/useWindowDestroy';
import LauncherIcon from '@/public/launcher.png';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { Launcher } from './Launcher';

export const LauncherButton = () => {
  const [{ processes }] = useProcessManager();
  const shellWindows = processes.get(PID_SHELL)?.windows;
  const isLauncherOpen = shellWindows?.length === 1;

  const createWindow = useWindowCreate();
  const destroyWindow = useWindowDestroy();

  const nextWid = useNextWindowID();

  const toggleLauncher = () => {
    if (isLauncherOpen) {
      destroyWindow(shellWindows[0]!);
    } else {
      createWindow({
        pid: PID_SHELL,
        wid: nextWid,
        title: 'Launcher',
        size: { x: 300, y: 500 },
        isEphemeral: true,
        render: (windowInfo) => <Launcher />,
      });
    }
  };

  return (
    <div
      className={twMergeClsx(
        `
          group z-0 flex size-12 cursor-pointer flex-row justify-center
          rounded-full bg-aero-tint-dark shadow-[0_0_0.3rem] ring
          shadow-white/60 ring-aero-tint-darkest transition duration-100
          hover:shadow-[0_0_0.5rem] hover:shadow-white/70
        `,
        isLauncherOpen &&
          `
            shadow-[0_0_0.3rem] shadow-white/80 transition
            hover:shadow-[0_0_0.3rem] hover:shadow-white/80
          `,
      )}
      onClick={toggleLauncher}
    >
      {/* upper reflection */}
      <div
        className={`
          absolute z-10 h-7 w-12 rounded-t-3xl rounded-b-sm bg-gradient-to-b
          from-white/40 to-white/5 inset-shadow-sm inset-shadow-white/40
          transition duration-100
          group-hover:from-white/50 group-hover:inset-shadow-white/60
        `}
      />
      {/* manual mask to round out the bottom */}
      <div
        className={`
          absolute z-20 mt-[1.62rem] h-2 w-10 rounded-[50%] bg-gradient-to-b
          from-aero-tint-dark from-40% to-transparent to-40%
        `}
      />
      {/* lower half glow */}
      <div
        className={`
          absolute z-30 size-12 rounded-full bg-radial-[at_50%_100%]
          from-aero-tint to-transparent to-50% transition duration-100
          group-hover:to-60%
        `}
      />
      <Image
        src={LauncherIcon}
        alt="launcher icon"
        className={`
          absolute z-30 mt-1 size-10 opacity-70 drop-shadow-[0_0_0]
          drop-shadow-transparent transition duration-100
          group-hover:opacity-100 group-hover:drop-shadow-[0_0_2px]
          group-hover:drop-shadow-white/50
        `}
        draggable={false}
      />
    </div>
  );
};
