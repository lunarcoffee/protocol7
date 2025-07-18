import clsx from 'clsx';
import LauncherIcon from '../public/launcher.png';
import Image from 'next/image';

export interface LauncherButtonProps {
  isActive: boolean;
}

export const LauncherButton = ({ isActive }: LauncherButtonProps) => {
  const mainBodyStyles = clsx(
    'w-12 h-12 rounded-full bg-aero-tint-dark flex flex-row justify-center shadow-[0_0_0.25rem] shadow-white/65 ring ring-black z-0 cursor-pointer group hover:shadow-[0_0_0.4rem] hover:shadow-white/80 transition',
    isActive && 'shadow-[0_0_0.3rem] shadow-white/80',
  );

  return (
    <div className={mainBodyStyles}>
      {/* upper reflection */}
      <div className="absolute w-12 h-7 rounded-t-3xl rounded-b-sm bg-gradient-to-b from-white/40 to-white/5 inset-shadow-sm inset-shadow-white/40 z-10 group-hover:from-white/50 group-hover:inset-shadow-white/60 transition" />
      {/* manual mask to round out the bottom */}
      <div className="absolute w-10 h-2 mt-[1.62rem] rounded-[50%] bg-gradient-to-b from-aero-tint-dark from-40% to-40% to-transparent z-20" />
      {/* lower half glow */}
      <div className="absolute w-12 h-12 rounded-full bg-radial-[at_50%_100%] from-aero-tint to-50% to-transparent z-30 group-hover:to-60% transition" />
      <Image
        src={LauncherIcon}
        alt="protocol7 symbol"
        className="absolute mt-1 w-10 h-10 z-30 opacity-70 drop-shadow-[0_0_0] drop-shadow-transparent group-hover:opacity-100 group-hover:drop-shadow-[0_0_2px] group-hover:drop-shadow-white/50 transition"
      />
    </div>
  );
};
