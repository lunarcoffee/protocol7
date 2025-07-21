import { PropsWithWindowInfo } from '@/components/contexts/WindowManagerContext';
import { useWindowDestroy } from '@/hooks/useWindowDestroy';

interface ControlButtonProps {
  bgFrom: string;
  bgTo: string;
  ring: string;
  topGlow: string;
  topShadow: string;
  bottomGlow: string;
  onClick: () => void;
}

const ControlButton = ({
  bgFrom,
  bgTo,
  ring,
  topGlow,
  topShadow,
  bottomGlow,
  onClick,
}: ControlButtonProps) => (
  <div
    onClick={onClick}
    // prevent dragging a window by the buttons
    onMouseDown={(event) => event.stopPropagation()}
    className={`size-4 rounded-full bg-gradient-to-t ${bgFrom} ${bgTo} inset-shadow-sm inset-shadow-black/70 ring ${ring} shadow-sm shadow-white/80 overflow-clip group hover:brightness-125 hover:shadow-white transition duration-75`}
  >
    <div className="relative">
      <div
        className={`absolute w-6 h-3 -ml-1 -mt-1 rounded-full bg-radial ${topGlow} to-50% to-transparent group-hover:brightness-125 transition duration-75`}
      ></div>
      <div
        className={`absolute size-4 rounded-full inset-shadow-[0_1px_2px] ${topShadow}`}
      ></div>
      <div
        className={`absolute w-4 h-4 mt-2 rounded-full bg-radial ${bottomGlow} to-70% to-transparent`}
      ></div>
    </div>
  </div>
);

export const ControlButtons = ({
  windowInfo: { pid, wid },
}: PropsWithWindowInfo) => {
  const destroyWindow = useWindowDestroy();

  return (
    <div className="flex flex-row items-center gap-2">
      <ControlButton
        bgFrom="from-lime-500"
        bgTo="to-lime-900"
        ring="ring-lime-950"
        topGlow="from-lime-200"
        topShadow="inset-shadow-lime-950"
        bottomGlow="from-lime-300"
        onClick={() => destroyWindow(pid, wid)}
      />
      <ControlButton
        bgFrom="from-yellow-400"
        bgTo="to-yellow-800"
        ring="ring-yellow-950"
        topGlow="from-yellow-200"
        topShadow="inset-shadow-yellow-950"
        bottomGlow="from-yellow-300"
        onClick={() => destroyWindow(pid, wid)}
      />
      <ControlButton
        bgFrom="from-red-500"
        bgTo="to-red-900"
        ring="ring-red-950"
        topGlow="from-red-200"
        topShadow="inset-shadow-red-950"
        bottomGlow="from-red-300"
        onClick={() => destroyWindow(pid, wid)}
      />
    </div>
  );
};
