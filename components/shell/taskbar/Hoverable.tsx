import { PropsWithChildren } from 'react';

export interface HoverableProps extends PropsWithChildren {
    glow?: boolean;
}

export const Hoverable = ({ glow = true, children }: HoverableProps) => (
    <div
        className={`
            group relative h-full rounded-xs outline outline-transparent transition duration-100
            hover:inset-shadow-[0_2px_6px] hover:inset-shadow-white/30 hover:outline-aero-tint-darkest/80
        `}
    >
        {glow && (
            <div
                className={`
                    absolute size-full bg-radial-[at_50%_140%] from-transparent to-transparent to-70%
                    transition duration-100
                    group-hover:from-aero-tint/80
                `}
            />
        )}
        {children}
    </div>
);
