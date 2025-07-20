import { PropsWithChildren } from 'react';

export interface HoverableProps extends PropsWithChildren {
  glow?: boolean;
}

export const Hoverable = ({ glow = true, children }: HoverableProps) => (
  <div className="relative h-full rounded-xs group hover:ring ring-aero-tint-darkest/80 hover:inset-shadow-sm hover:inset-shadow-white/30 transition duration-100">
    {glow && (
      <div className="absolute w-full h-full bg-radial-[at_50%_140%] from-transparent to-70% to-transparent group-hover:from-aero-tint/80 transition duration-100"></div>
    )}
    {children}
  </div>
);
