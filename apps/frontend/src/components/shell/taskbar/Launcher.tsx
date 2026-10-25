import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

export const Launcher = ({ winfo: { zIndex } }: PropsWithWindowInfo) => {
    return <div className="absolute bottom-0 left-0 mb-10 h-120 w-80 bg-red-400/20" style={{ zIndex }} />;
};
