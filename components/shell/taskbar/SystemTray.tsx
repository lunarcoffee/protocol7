import { JSX } from 'react';
import { Hoverable } from './Hoverable';

export interface SystemTrayItem {
  renderIcon: () => JSX.Element;
  renderPane: () => JSX.Element;
}

export interface SystemTrayProps {
  items: SystemTrayItem[];
}

export const SystemTray = ({ items }: SystemTrayProps) => (
  <div className="flex flex-row justify-center">
    {items.map((item, i) => (
      <Hoverable glow={false} key={i}>
        <div className="drop-shadow-xs drop-shadow-aero-tint-darkest">
          {item.renderIcon()}
        </div>
      </Hoverable>
    ))}
  </div>
);
