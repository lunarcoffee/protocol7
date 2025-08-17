export interface ControlButtonProps {
  bgFrom: string;
  bgTo: string;
  ring: string;
  topGlow: string;
  topShadow: string;
  bottomGlow: string;
  onClick: () => void;
}

export const ControlButton = ({
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
      <div
        className={`
          absolute -mt-1 -ml-1 h-3 w-6 rounded-full bg-radial
          ${topGlow}
          to-transparent to-50% transition duration-75
          group-hover:brightness-125
          group-active:brightness-80
        `}
      ></div>
      <div
        className={`
          absolute size-4 rounded-full inset-shadow-[0_1px_2px]
          ${topShadow}
        `}
      ></div>
      <div
        className={`
          absolute mt-2 h-4 w-4 rounded-full bg-radial
          ${bottomGlow}
          to-transparent to-70%
        `}
      ></div>
    </div>
  </div>
);
