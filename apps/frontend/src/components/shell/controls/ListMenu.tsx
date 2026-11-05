import { AnimatePresence, motion } from 'motion/react';
import { type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from 'react';

import { rightCaretIcon } from '../fileManager/Breadcrumbs';
import { PositionAnchor, type PositionAnchorProps } from './PositionAnchor';
import { useShellProcessSettings } from '@/hooks/processes';
import { useBoolean } from '@/hooks/useBoolean';
import { useTimeout } from '@/hooks/useTimeout';
import { getSystemIcon } from '@/utils/getSystemIcon';

type ListMenuLabeledItem = { label: string; icon?: string | ReactNode };
type ListMenuButtonItem = ListMenuLabeledItem & { type: 'button'; onClick: () => void };
type ListMenuSubmenuItem = ListMenuLabeledItem & { type: 'submenu'; subItems: ListMenuItem[] };

type ListMenuSeparatorItem = { type: 'separator' };

export type ListMenuItem = ListMenuButtonItem | ListMenuSubmenuItem | ListMenuSeparatorItem;

const ListMenuSeparatorRow = () => <div className="mx-1 my-0.5 border-y border-t-aero-tint/30 border-b-white" />;

interface ListMenuRowIconProps {
    icon: ListMenuLabeledItem['icon'];
}

const ListMenuRowIcon = ({ icon }: ListMenuRowIconProps) => (
    <div className="flex w-6 items-center px-1">
        {typeof icon === 'string' ? <img src={getSystemIcon(icon)} width={16} height={16} /> : icon}
    </div>
);

interface ListMenuRowProps<T> {
    item: T;
    hide: () => void;
}

const ListMenuButtonRow = ({ item, hide }: ListMenuRowProps<ListMenuButtonItem>) => {
    const { label, icon, onClick } = item;

    return (
        <div
            onClick={() => {
                hide();
                onClick();
            }}
            className="
                flex flex-row gap-1 rounded-xs bg-linear-to-b py-0.5 pr-2 pl-1 inset-ring-gray-200
                outline-aero-tint/40
                hover:from-white/50 hover:to-aero-tint-highlight hover:inset-ring hover:outline
            "
        >
            <ListMenuRowIcon icon={icon} />
            {label}
        </div>
    );
};

const ListMenuSubmenuRow = ({ item, hide }: ListMenuRowProps<ListMenuSubmenuItem>) => {
    const { label, icon, subItems } = item;

    const submenuDelay = useShellProcessSettings(({ listMenuSubmenuDelay }) => listMenuSubmenuDelay);

    const [isVisible, setVisible, setNotVisible] = useBoolean();

    const [cancelOpen, restartOpen] = useTimeout(submenuDelay, setVisible);
    const [cancelClose, restartClose] = useTimeout(submenuDelay, setNotVisible);

    // we need the position of this row itself in order to position the submenu
    const rowRef = useRef<HTMLDivElement>(null);

    const [positionAnchorProps, setPositionAnchorProps] = useState<PositionAnchorProps>();

    useEffect(() => {
        if (!rowRef.current) return;

        const { top, right, left, height } = rowRef.current.getBoundingClientRect();
        setPositionAnchorProps({
            position: { x: right, y: top },
            fallbackX: left,
            flippedYOffset: height,
        });
    }, []);

    return (
        <div
            ref={rowRef}
            onMouseEnter={() => {
                cancelClose();
                restartOpen();
            }}
            onMouseLeave={() => {
                cancelOpen();
                restartClose();
            }}
            className="
                flex flex-row gap-1 rounded-xs bg-linear-to-b py-0.5 pl-1 inset-ring-gray-200
                outline-aero-tint/40
                hover:from-white/50 hover:to-aero-tint-highlight hover:inset-ring hover:outline
            "
        >
            <ListMenuRowIcon icon={icon} />
            <div className="pr-2">{label}</div>
            <div className="flex grow items-center justify-end">{rightCaretIcon}</div>

            {positionAnchorProps && (
                <ListMenu
                    items={subItems}
                    isVisible={isVisible}
                    hide={() => {
                        hide();
                        setNotVisible();
                    }}
                    positionAnchorProps={positionAnchorProps}
                />
            )}
        </div>
    );
};

export interface ListMenuProps extends PropsWithChildren {
    items: ListMenuItem[];
    isVisible?: boolean;
    // used to hide the menu after clicking an item
    hide: () => void;

    positionAnchorProps?: PositionAnchorProps;
    positionRefreshToken?: number;
}

export const ListMenu = ({
    items,
    isVisible = true,
    hide,
    positionAnchorProps = {},
    positionRefreshToken = 0,
}: ListMenuProps) => {
    let separatorCounter = 0;

    const getListMenuItemKey = (item: ListMenuItem) => {
        if (item.type === 'separator') {
            separatorCounter++;
            return `separator-${separatorCounter}`;
        }
        return `${item.label}${typeof item.icon === 'string' ? item.icon : ''}`;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <PositionAnchor key={positionRefreshToken} {...positionAnchorProps} className="z-[calc(infinity)]">
                    <motion.div
                        onMouseDownCapture={(event) => event.stopPropagation()}
                        className="
                            max-w-lg min-w-50 rounded-sm border border-aero-tint-dark bg-linear-to-br
                            from-gray-100 to-aero-tint-highlight p-0.75 text-xs text-aero-tint-dark shadow-md
                            shadow-aero-tint-darkest/30
                        "
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        {items.map((item) => {
                            const key = getListMenuItemKey(item);

                            if (item.type === 'separator') return <ListMenuSeparatorRow key={key} />;
                            if (item.type === 'button') return <ListMenuButtonRow key={key} item={item} hide={hide} />;
                            return <ListMenuSubmenuRow key={key} item={item} hide={hide} />;
                        })}
                    </motion.div>
                </PositionAnchor>
            )}
        </AnimatePresence>
    );
};
