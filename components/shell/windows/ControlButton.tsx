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
