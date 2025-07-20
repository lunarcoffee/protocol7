import Image from 'next/image';
import Wallpaper from '../public/wallpapers/toronto.jpg';
import { ProcessInfoContextProvider } from './contexts/ProcessInfoContext';
import { Taskbar } from './taskbar/Taskbar';

const Desktop = () => {
  return (
    <div className="aspect-[16/10] max-w-[144lvh] min-w-0 max-h-[90lvh] min-h-0 overflow-clip relative">
      <Image src={Wallpaper} alt="desktop wallpaper" draggable={false} />
      <ProcessInfoContextProvider>
        <Taskbar />
      </ProcessInfoContextProvider>
    </div>
  );
};

export const Computer = () => (
  <div className="w-lvw h-lvh p-10 flex items-center justify-center select-none">
    <Desktop />
  </div>
);
