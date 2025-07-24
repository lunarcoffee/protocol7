'use client';

import Image from 'next/image';
import Wallpaper from '@/public/wallpapers/subway.jpg';
import { useFocusDesktop } from '@/hooks/windows/useFocusDesktop';

export const Desktop = () => {
  const focusDesktop = useFocusDesktop();

  // TODO: icons and stuff etc :)
  return (
    <div className="relative size-[max(100vw,100vh)]">
      <Image
        src={Wallpaper}
        alt="desktop wallpaper"
        draggable={false}
        priority
        className="absolute"
      />
      <div
        onMouseDown={() => focusDesktop()}
        className="absolute size-full"
      ></div>
    </div>
  );
};
