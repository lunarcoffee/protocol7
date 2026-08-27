'use client';

import { AnimatePresence } from 'motion/react';

import { useWindowManager } from '@/hooks/useWindowManager';

export const WindowLayer = () => {
    const { windows } = useWindowManager();

    return (
        <div id="window-layer" className="absolute inset-0">
            <AnimatePresence>
                {Array.from(windows.values(), (info) => {
                    const { wid, render } = info;
                    return <div key={wid}>{render(info)}</div>;
                })}
            </AnimatePresence>
        </div>
    );
};
