import { PropsWithWindowInfo } from '@/components/contexts/system/windows/WindowManager';
import { useWindowManager } from '@/hooks/useWindowManager';

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
    className={`
      size-4 rounded-full bg-gradient-to-t
      ${bgFrom}
      ${bgTo}
      ring inset-shadow-sm inset-shadow-black/70
      ${ring}
      group overflow-clip shadow-sm shadow-white/80 transition duration-75
      hover:shadow-white hover:brightness-125
      active:shadow-white active:brightness-80
    `}
  >
    <div className="relative">
      {/* top reflective glow */}
      <div
        className={`
          absolute -mt-1 -ml-1 h-3 w-6 rounded-full bg-radial
          ${topGlow}
          to-transparent to-50% transition duration-75
          group-hover:brightness-125
          group-active:brightness-80
        `}
      />
      {/* upper half drop shadow */}
      <div
        className={`
          absolute size-4 rounded-full inset-shadow-[0_1px_2px]
          ${topShadow}
        `}
      />
      {/* bottom glow */}
      <div
        className={`
          absolute mt-2 h-4 w-4 rounded-full bg-radial
          ${bottomGlow}
          to-transparent to-70%
        `}
      />
    </div>
  </div>
);

export const ControlButtons = ({
  windowInfo: { wid },
}: PropsWithWindowInfo) => {
  const wm = useWindowManager();

  return (
    <div className="flex flex-row items-center gap-2">
      <ControlButton
        bgFrom="from-lime-500"
        bgTo="to-lime-900"
        ring="ring-lime-950"
        topGlow="from-lime-200"
        topShadow="inset-shadow-lime-950"
        bottomGlow="from-lime-300"
        onClick={() => wm.minimize(wid)}
      />
      <ControlButton
        bgFrom="from-yellow-400"
        bgTo="to-yellow-800"
        ring="ring-yellow-950"
        topGlow="from-yellow-200"
        topShadow="inset-shadow-yellow-950"
        bottomGlow="from-yellow-300"
        onClick={() => wm.maximize(wid)}
      />
      <ControlButton
        bgFrom="from-red-500"
        bgTo="to-red-900"
        ring="ring-red-950"
        topGlow="from-red-200"
        topShadow="inset-shadow-red-950"
        bottomGlow="from-red-300"
        onClick={() => wm.destroy(wid)}
      />
    </div>
  );
};
