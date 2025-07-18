import Image from 'next/image';
import Wallpaper from '../public/toronto.jpg';
import { ProcessInfoContextProvider } from './contexts/ProcessInfoContext';
import { Taskbar } from './Taskbar';

const Desktop = () => {
  return (
    <div className="w-[144lvh] h-[90lvh] overflow-clip relative">
      <Image src={Wallpaper} alt="desktop wallpaper" />
      <ProcessInfoContextProvider>
        <Taskbar />
      </ProcessInfoContextProvider>
    </div>
  );
};

export const Computer = () => (
  <div className="w-lvw h-lvh p-10 flex items-center justify-center">
    <Desktop />
  </div>
);
