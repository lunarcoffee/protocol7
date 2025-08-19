import { PropsWithWindowInfo } from '@/components/contexts/system/WindowManager';

export const Launcher = ({ windowInfo: { zIndex } }: PropsWithWindowInfo) => {
  return (
    <div
      className="absolute bottom-0 left-0 mb-10 h-120 w-80 bg-red-400/20"
      style={{ zIndex }}
    ></div>
  );
};
