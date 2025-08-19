import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import { twMergeClsx } from '@/utils/twMergeClsx';

export interface DesktopIconProps {
  icon: string | StaticImport;
  label: string;
  onLaunch: () => void;

  isSelected: boolean;
  onSelectionChange: (isSelected: boolean) => void;
}

// TODO: tooltip on hover

export const DesktopIcon = ({
  icon,
  label,
  onLaunch,
  isSelected,
  onSelectionChange,
}: DesktopIconProps) => (
  <div
    className={twMergeClsx(
      `
        flex h-fit w-20 flex-col items-center gap-1.5 overflow-visible
        rounded-xs pt-1
        hover:bg-aero-tint-highlight/25 hover:ring
        hover:ring-aero-tint-highlight/30
      `,
      isSelected &&
        `
          bg-aero-tint-highlight/45 ring ring-aero-tint-highlight/50
          hover:bg-aero-tint-highlight/55 hover:ring
          hover:ring-aero-tint-highlight/60
        `,
    )}
    onMouseDown={() => onSelectionChange(true)}
    onDoubleClick={() => {
      onSelectionChange(false);
      onLaunch();
    }}
  >
    <div
      className={`
        flex h-15 w-15 items-center justify-center drop-shadow-md
        drop-shadow-aero-tint-darkest/50
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
          (isSelected && 'line-clamp-4') || 'line-clamp-2',
        )}
      >
        {label}
      </p>
    </div>
  </div>
);
