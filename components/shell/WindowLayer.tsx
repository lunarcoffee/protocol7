'use client';

import { AnimatePresence } from 'motion/react';

import { WindowID } from '@/components/stores/system/windows/WindowManager';
import { useWindow, useWindowIDs } from '@/hooks/useWindowManager';

const Window = ({ wid }: { wid: WindowID }) => {
    const windowInfo = useWindow(wid);
    return windowInfo ? <div>{windowInfo.render(windowInfo)}</div> : null;
};

export const WindowLayer = () => {
    const windowIDs = useWindowIDs();

    return (
        <div id="window-layer" className="absolute inset-0">
            <AnimatePresence>
                {windowIDs.map((wid) => (
                    <Window key={wid} wid={wid} />
                ))}
            </AnimatePresence>
        </div>
    );
};
