import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { MouseEvent } from 'react';

import { twMergeClsx } from '@/utils/twMergeClsx';

export interface DesktopIconProps {
  id: string; // in practice, this is the name of the desktop icon file

  icon: string | StaticImport;
  label: string;
  onLaunch: () => void;

  isSelected: boolean;
  onClick: (event: MouseEvent) => void;
}

// TODO: tooltip on hover

export const DesktopIcon = ({
  id,
  icon,
  label,
  onLaunch,
  isSelected,
  onClick,
}: DesktopIconProps) => (
  <div
    id={`desktop-icon-${id}`}
    className={twMergeClsx(
      `
        flex h-fit w-20 flex-col items-center gap-1.5 overflow-visible
        rounded-xs pt-1
        hover:bg-aero-tint-highlight/25 hover:shadow-[0_0_4px] hover:ring
        hover:shadow-aero-tint-highlight/25 hover:ring-aero-tint-highlight/25
      `,
      isSelected &&
        `
          bg-aero-tint-highlight/45 shadow-[0_0_4px] ring
          shadow-aero-tint-highlight/45 ring-aero-tint-highlight/45
          hover:bg-aero-tint-highlight/55 hover:ring
          hover:shadow-aero-tint-highlight/55 hover:ring-aero-tint-highlight/55
        `,
    )}
    onMouseDown={onClick}
    onDoubleClick={onLaunch}
  >
    <div
      className={`
        flex h-15 w-15 items-center justify-center drop-shadow-sm
        drop-shadow-aero-tint-darkest/70
      `}
    >
      <Image src={icon} alt={label} draggable={false} />
    </div>
    <div className="flex w-20 justify-center overflow-visible">
      <p
        className={twMergeClsx(
          `
            px-0.5 pb-0.5 text-center text-xs break-words
            text-shadow-aero-tint-darkest text-shadow-md
          `,
          isSelected ? 'line-clamp-4' : 'line-clamp-2',
        )}
      >
        {label}
      </p>
    </div>
  </div>
);
