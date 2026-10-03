import { AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { useWindow, useWindowIDs } from '@/hooks/windows';
import { WindowID } from '@/stores/system/windows/WindowManager';

interface WindowProps {
    wid: WindowID;
}

const Window = ({ wid }: WindowProps) => {
    const windowInfo = useWindow(wid);

    // store previous window info to allow windows to render even after closing by using the last known state; this
    // enables `exit` animations which only happen after the window is closed
    const [prevWindowInfo, setPrevWindowInfo] = useState(windowInfo);
    if (windowInfo && windowInfo !== prevWindowInfo) setPrevWindowInfo(windowInfo);

    const latestWindowInfo = windowInfo ?? prevWindowInfo;
    return latestWindowInfo?.render(latestWindowInfo);
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
