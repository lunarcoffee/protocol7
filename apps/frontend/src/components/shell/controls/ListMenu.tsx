import { AnimatePresence, motion } from 'motion/react';
import { type PropsWithChildren } from 'react';

import { PositionAnchor } from './PositionAnchor';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { Dimensions } from '@/utils/Dimensions';

type ListMenuLabeledItem = { label: string; icon?: string };
type ListMenuButtonItem = ListMenuLabeledItem & { type: 'button'; onClick: () => void };
type ListMenuSubmenuItem = ListMenuLabeledItem & { type: 'submenu'; subItems: ListMenuItem[] };

type ListMenuSeparatorItem = { type: 'separator' };

export type ListMenuItem = ListMenuButtonItem | ListMenuSubmenuItem | ListMenuSeparatorItem;

export interface ListMenuProps extends PropsWithChildren {
    items: ListMenuItem[];
    isVisible?: boolean;

    position?: Dimensions;
    positionRefreshToken?: number;
}

export const ListMenu = ({ items, position, isVisible = true, positionRefreshToken = 0 }: ListMenuProps) => {
    let separatorCounter = 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <PositionAnchor key={positionRefreshToken} position={position} className="z-[calc(infinity)]">
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
                            if (item.type === 'separator') {
                                separatorCounter++;
                                return (
                                    <div
                                        key={`separator-${separatorCounter}`}
                                        className="my-0.5 border-y border-t-aero-tint/30 border-b-white"
                                    />
                                );
                            }

                            const { label, icon } = item;
                            const isSubmenu = item.type === 'submenu';
                            return (
                                <div
                                    key={`${label}-${icon}`}
                                    {...(isSubmenu ? {} : { onClick: item.onClick })}
                                    className="
                                        flex flex-row gap-1 rounded-xs bg-linear-to-b py-0.5 pr-2 pl-1
                                        inset-ring-gray-200 outline-aero-tint/40
                                        hover:from-white/50 hover:to-aero-tint-highlight hover:inset-ring
                                        hover:outline
                                    "
                                >
                                    <div className="w-6 px-1">
                                        {icon && <img src={getSystemIcon(icon)} width={16} height={16} />}
                                    </div>
                                    {label}
                                </div>
                            );
                        })}
                    </motion.div>
                </PositionAnchor>
            )}
        </AnimatePresence>
    );
};
