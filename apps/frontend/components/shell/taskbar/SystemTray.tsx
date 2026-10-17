import { Hoverable } from './Hoverable';

import type { JSX, Key } from 'react';

export interface SystemTrayItem {
    renderIcon: () => JSX.Element;
    renderPane: () => JSX.Element;

    key: Key;
}

export interface SystemTrayProps {
    items: SystemTrayItem[];
}

export const SystemTray = ({ items }: SystemTrayProps) => (
    <div className="flex flex-row justify-center">
        {items.map(({ renderIcon, key }) => (
            <Hoverable glow={false} key={key}>
                <div className="drop-shadow-xs drop-shadow-aero-tint-darkest">{renderIcon()}</div>
            </Hoverable>
        ))}
    </div>
);
