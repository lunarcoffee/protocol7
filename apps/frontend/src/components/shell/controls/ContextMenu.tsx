import { type PropsWithChildren } from 'react';

import { ListMenu, type ListMenuItem } from './ListMenu';
import { useBoolean } from '@/hooks/useBoolean';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { getShellRootElement } from '@/utils/getShellRootElement';

export interface ContextMenuProps extends PropsWithChildren {
    items: ListMenuItem[];

    className?: string;
}

export const ContextMenu = ({ items, className, children }: ContextMenuProps) => {
    const [isVisible, setVisible, setNotVisible] = useBoolean();
    const [refreshToken, refreshMenuPosition] = useRefreshToken();

    const shellRoot = getShellRootElement()!;

    const showContextMenu = () => {
        refreshMenuPosition();
        setVisible();
        shellRoot.addEventListener('mousedown', hideContextMenu);
    };

    const hideContextMenu = () => {
        setNotVisible();
        shellRoot.removeEventListener('mousedown', hideContextMenu);
    };

    return (
        <div onContextMenu={showContextMenu} className={className}>
            {children}
            <ListMenu items={items} isVisible={isVisible} positionRefreshToken={refreshToken} />
        </div>
    );
};
