import type { SVGProps } from 'react';

// TODO: attribution info as an app
// CC-BY:
// https://www.svgrepo.com/svg/322017/check-mark
export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props} className="overflow-visible">
        <path
            fill="currentColor"
            d="M17.47 250.9C88.82 328.1 158 397.6 224.5 485.5c72.3-143.8 146.3-288.1 268.4-444.37L460 26.06C356.9 135.4 276.8 238.9 207.2 361.9c-48.4-43.6-126.62-105.3-174.38-137z"
        />
    </svg>
);
