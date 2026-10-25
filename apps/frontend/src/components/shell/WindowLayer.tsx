import { AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { useWindow, useWindowIDs } from '@/hooks/windows';
import { shallowArrayEquals } from '@/utils/shallowArrayEquals';

import type { WindowID } from '@/stores/system/windows/WindowManager';

interface WindowProps {
    wid: WindowID;
}

const Window = ({ wid }: WindowProps) => {
    const window = useWindow(wid);

    // store previous window state to allow windows to render even after closing by using the last known state; this
    // enables `exit` animations which only happen after the window is closed
    const [prevWindow, setPrevWindow] = useState(window);
    if (window && !shallowArrayEquals(window, prevWindow)) setPrevWindow(window);

    const latestWindow = window ?? prevWindow;
    if (!latestWindow) return null;

    const [winfo, pinfo] = latestWindow;
    return winfo.render(pinfo, winfo);
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
