import { PropsWithChildren } from 'react';

export interface HoverableProps extends PropsWithChildren {
  glow?: boolean;
}

export const Hoverable = ({ glow = true, children }: HoverableProps) => (
  <div
    className={`
      group relative h-full rounded-xs ring-aero-tint-darkest/80 transition
      duration-100
      hover:ring hover:inset-shadow-[0_2px_6px] hover:inset-shadow-white/30
    `}
  >
    {glow && (
      <div
        className={`
          absolute h-full w-full bg-radial-[at_50%_140%] from-transparent
          to-transparent to-70% transition duration-100
          group-hover:from-aero-tint/80
        `}
      ></div>
    )}
    {children}
  </div>
);
