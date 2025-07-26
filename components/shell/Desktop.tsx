'use client';

import Image from 'next/image';
import Wallpaper from '@/public/wallpapers/leaves.jpg';
import { useFocusDesktop } from '@/hooks/windows/useFocusDesktop';

export const Desktop = () => {
  const focusDesktop = useFocusDesktop();

  // TODO: icons and stuff etc :)
  return (
    <div className="relative size-full">
      <Image
        src={Wallpaper}
        alt="desktop wallpaper"
        draggable={false}
        priority
        className="absolute size-full object-cover object-center"
      />
      <div
        onMouseDown={() => focusDesktop()}
        className="absolute size-full"
      ></div>
    </div>
  );
};
