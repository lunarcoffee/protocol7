import { PropsWithWindowInfo } from '@/components/contexts/WindowManagerContext';
import { useWindowDestroy } from '@/hooks/windows/useWindowDestroy';
import { useWindowMaximize } from '@/hooks/windows/useWindowMaximize';
import { useWindowMinimize } from '@/hooks/windows/useWindowMinimize';

import { ControlButton } from './ControlButton';

export const ControlButtons = ({
  windowInfo: { wid },
}: PropsWithWindowInfo) => {
  const minimizeWindow = useWindowMinimize();
  const maximizeWindow = useWindowMaximize();
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
        onClick={() => minimizeWindow(wid)}
      />
      <ControlButton
        bgFrom="from-yellow-400"
        bgTo="to-yellow-800"
        ring="ring-yellow-950"
        topGlow="from-yellow-200"
        topShadow="inset-shadow-yellow-950"
        bottomGlow="from-yellow-300"
        onClick={() => maximizeWindow(wid)}
      />
      <ControlButton
        bgFrom="from-red-500"
        bgTo="to-red-900"
        ring="ring-red-950"
        topGlow="from-red-200"
        topShadow="inset-shadow-red-950"
        bottomGlow="from-red-300"
        onClick={() => destroyWindow(wid)}
      />
    </div>
  );
};
