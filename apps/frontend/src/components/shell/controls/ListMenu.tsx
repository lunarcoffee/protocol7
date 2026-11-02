import { AnimatePresence, motion } from 'motion/react';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { rightCaretIcon } from '../fileManager/Breadcrumbs';
import { PositionAnchor, type PositionAnchorProps } from './PositionAnchor';
import { useBoolean } from '@/hooks/useBoolean';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { Dimensions } from '@/utils/Dimensions';

type ListMenuLabeledItem = { label: string; icon?: string };
type ListMenuButtonItem = ListMenuLabeledItem & { type: 'button'; onClick: () => void };
type ListMenuSubmenuItem = ListMenuLabeledItem & { type: 'submenu'; subItems: ListMenuItem[] };

type ListMenuSeparatorItem = { type: 'separator' };

export type ListMenuItem = ListMenuButtonItem | ListMenuSubmenuItem | ListMenuSeparatorItem;

const ListMenuSeparatorRow = () => <div className="mx-1 my-0.5 border-y border-t-aero-tint/30 border-b-white" />;

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
            <div className="w-6 px-1">{icon && <img src={getSystemIcon(icon)} width={16} height={16} />}</div>
            {label}
        </div>
    );
};

const ListMenuSubmenuRow = ({ item, hide }: ListMenuRowProps<ListMenuSubmenuItem>) => {
    const { label, icon, subItems } = item;

    const [isVisible, setVisible, setNotVisible] = useBoolean();
    const rowRef = useRef<HTMLDivElement>(null);

    const [initialPosition, setInitialPosition] = useState<Dimensions>();
    const [fallbackX, setFallbackX] = useState<number>();

    useEffect(() => {
        if (!rowRef.current) return;

        const { top, right, left } = rowRef.current.getBoundingClientRect();
        setInitialPosition({ x: right, y: top });
        setFallbackX(left);
    }, []);

    return (
        <div
            ref={rowRef}
            onMouseEnter={setVisible}
            onMouseLeave={setNotVisible}
            className="
                flex flex-row gap-1 rounded-xs bg-linear-to-b py-0.5 pl-1 inset-ring-gray-200
                outline-aero-tint/40
                hover:from-white/50 hover:to-aero-tint-highlight hover:inset-ring hover:outline
            "
        >
            <div className="w-6 px-1">{icon && <img src={getSystemIcon(icon)} width={16} height={16} />}</div>
            <div className="pr-2">{label}</div>
            <div className="flex grow items-center justify-end">{rightCaretIcon}</div>
            {fallbackX &&
                createPortal(
                    <div className="absolute size-2 bg-red-500" style={{ left: fallbackX.x, top: fallbackX.y }} />,
                    document.body,
                )}
            {initialPosition && fallbackX && (
                <ListMenu
                    items={subItems}
                    isVisible={isVisible}
                    hide={() => {
                        hide();
                        setNotVisible();
                    }}
                    positionAnchorProps={{ position: initialPosition, fallbackX }}
                />
            )}
        </div>
    );
};

export interface ListMenuProps extends PropsWithChildren {
    items: ListMenuItem[];
    isVisible?: boolean;
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
        return `${item.label}-${item.icon}`;
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
