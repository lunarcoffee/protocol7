import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import { twMergeClsx } from '@/utils/twMergeClsx';

export interface IconProps {
  icon: string | StaticImport;
  label: string;
  onLaunch: () => void;

  isSelected: boolean;
  // TODO: do we even need this parameter? is it always gonna be true
  onSelectionChange: (isSelected: boolean) => void;
}

// TODO: tooltip on hover

export const Icon = ({
  icon,
  label,
  onLaunch,
  isSelected,
  onSelectionChange,
}: IconProps) => (
  <div
    className={twMergeClsx(
      `
        group flex h-fit max-h-30 w-22 flex-col items-center gap-1.5 rounded-xs
        pt-1
        hover:bg-aero-tint-highlight/30 hover:ring
        hover:ring-aero-tint-highlight/40
      `,
      isSelected &&
        `
          bg-aero-tint-highlight/40 ring ring-aero-tint-highlight/50
          hover:bg-aero-tint-highlight/50 hover:ring
          hover:ring-aero-tint-highlight/60
        `,
    )}
    onMouseDown={() => onSelectionChange(true)}
    onDoubleClick={onLaunch}
  >
    <div
      className={`
        flex h-16 w-16 items-center justify-center drop-shadow-md
        drop-shadow-aero-tint-darkest/50
      `}
    >
      <Image src={icon} alt={label} draggable={false} />
    </div>
    <div className="flex max-h-10 w-22 justify-center overflow-visible">
      <div
        className={`
          line-clamp-2 pb-1 text-center text-xs break-words
          text-shadow-aero-tint-darkest/80 text-shadow-md
        `}
      >
        {label}
      </div>
    </div>
  </div>
);
