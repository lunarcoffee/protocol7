import { HTMLAttributes } from 'react';

export const HeadingText = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p
        {...props}
        className={`
            ${className}
            text-[11px] font-semibold text-aero-tint text-shadow-2xs text-shadow-white
        `}
    >
        {children}
    </p>
);
