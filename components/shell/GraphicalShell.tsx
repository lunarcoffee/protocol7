'use client';

import { enableMapSet } from 'immer';
import { useEffect } from 'react';

import { useProcessManager } from '@/hooks/useProcessManager';
import { useWindowManager } from '@/hooks/useWindowManager';

import { PID_SHELL } from '../contexts/system/processes/ProcessManager';
import {
  WID_DESKTOP,
  WID_TASKBAR,
} from '../contexts/system/windows/WindowManager';
import { Desktop } from './desktop/Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { WindowLayer } from './WindowLayer';

enableMapSet();

export const GraphicalShell = () => {
  const pm = useProcessManager();
  const wm = useWindowManager();

  // spawn core shell apps
  useEffect(() => {
    pm.create({ pid: PID_SHELL, isHeadless: true });

    wm.create({
      pid: PID_SHELL,
      wid: WID_DESKTOP,
      render: (windowInfo) => <Desktop windowInfo={windowInfo} />,
    });
    wm.create({
      pid: PID_SHELL,
      wid: WID_TASKBAR,
      render: () => <Taskbar />,
    });

    return () => pm.destroy(PID_SHELL);
    // wm/pm actions only use reducer dispatches which are referentially stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // maintain 16:10 (8:5) aspect ratio but take up at most 90% of the entire viewport
    <div
      className={`
        absolute top-0 right-0 bottom-0 left-0 m-auto h-[calc(5/8*90lvw)]
        max-h-9/10 w-9/10 max-w-[calc(8/5*90lvh)] overflow-clip
      `}
    >
      <WindowLayer />
    </div>
  );
};
