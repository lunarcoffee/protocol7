'use client';

import { useProcessInfo } from './contexts/ProcessInfoContext';
import { LauncherButton } from './LauncherButton';

export const Taskbar = () => {
  const [processInfo, updateProcessInfo] = useProcessInfo();

  return (
    <div className="absolute bottom-0 w-full h-10 pl-4 bg-gradient-to-t from-aero-tint-dark/50 via-95% via-aero-tint/40 to-white/40 backdrop-blur-xs border-t border-t-black flex flex-row items-center">
      <div className="flex left-4 -mt-1">
        <LauncherButton />
      </div>
    </div>
  );
};
