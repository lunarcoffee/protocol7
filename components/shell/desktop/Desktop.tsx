'use client';

import { Draft } from 'immer';
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useImmerReducer } from 'use-immer';

import { useDirectory } from '@/hooks/filesystem/useDirectory';
import { useFile } from '@/hooks/filesystem/useFile';
import { useBoolean } from '@/hooks/useBoolean';
import { useFocusWindow } from '@/hooks/windows';
import { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';
import { Dimensions, toScreenPosition } from '@/utils/Dimensions';
import { doRectanglesIntersect } from '@/utils/doRectanglesIntersect';
import { handleMouseDrag } from '@/utils/handleMouseDrag';

import { DesktopIcon, DesktopIconProps } from './DesktopIcon';

const Wallpaper = () => {
    const [file] = useFile('wallpapers/flowers.jpg');
    if (!file?.ok) return null;

    return (
        <div className="absolute size-full bg-aero-tint-darkest object-cover object-center">
            <img
                src={file.readToObjectURL()}
                alt="desktop wallpaper"
                draggable={false}
                className="absolute size-full object-cover object-center"
            />
        </div>
    );
};

// const iconData = new Map([
//     ['1.desktop', { icon: Maple, label: 'HPIM_3328.jpg' }],
//     ['2.desktop', { icon: Garden, label: 'HPIM_3329.jpg' }],
//     ['3.desktop', { icon: Battery, label: 'battery indicator.svg' }],
//     ['4.desktop', { icon: Wireless, label: 'signal.jpg' }],
//     [
//         '5.desktop',
//         {
//             icon: Launcher,
//             label: 'hanyu english字典 translation dictionary.txt',
//         },
//     ],
// ]);

type IconStates = Map<string, Pick<DesktopIconProps, 'isSelected' | 'onClick'>>;
type UpdateIconAction =
    | { action: 'set'; iconPath: string; value: boolean }
    | { action: 'toggle'; iconPath: string }
    | { action: 'reset'; iconStates: IconStates };

const iconStateReducer = (draft: Draft<IconStates>, action: UpdateIconAction) => {
    switch (action.action) {
        case 'set': {
            const { iconPath, value } = action;
            draft.get(iconPath)!.isSelected = value;
            break;
        }
        case 'toggle': {
            const { iconPath } = action;
            draft.get(iconPath)!.isSelected = !draft.get(iconPath)!.isSelected;
            break;
        }
        case 'reset': {
            return action.iconStates;
        }
    }
};

export const Desktop = ({ windowInfo: { wid, hasFocus } }: PropsWithWindowInfo) => {
    const focusWindow = useFocusWindow();

    const [dir] = useDirectory('Users/lunarcoffee/Desktop');
    const iconPaths = dir?.ok ? dir.entriesAbsolute() : [];
    console.log('paths', iconPaths);

    const [icons, updateIcons] = useImmerReducer(iconStateReducer, new Map());

    const deselectAllIcons = useCallback(
        () => icons.forEach((_, iconPath) => updateIcons({ action: 'set', iconPath, value: false })),
        // `updateIcon` is a reducer dispatch and is referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [icons],
    );

    // in the latest mouseDown event, was an icon clicked or just the desktop? this value informs
    // the behavior of mouseDown handlers so they can implement icon selection properly
    const wasIconClicked = useRef(false);

    const [prevIconPaths, setPrevIconPaths] = useState(iconPaths);
    console.log('prev', prevIconPaths);
    if (iconPaths.length !== prevIconPaths.length) {
        setPrevIconPaths(iconPaths);
        const iconStates = new Map(
            [...iconPaths].map((iconPath) => [
                iconPath,
                {
                    isSelected: false,
                    onClick: (event: MouseEvent) => {
                        // clicking an icon in multi-select mode (holding control) toggles the selection state; otherwise,
                        // it is always set to true
                        const isMultiSelect = event.getModifierState('Control');
                        if (!isMultiSelect) {
                            deselectAllIcons();
                            updateIcons({ action: 'set', iconPath, value: true });
                        } else {
                            updateIcons({ action: 'toggle', iconPath });
                        }

                        wasIconClicked.current = true;
                    },
                },
            ]),
        );

        updateIcons({ action: 'reset', iconStates });
    }

    // deselect icons on losing focus
    useEffect(() => {
        if (!hasFocus) deselectAllIcons();
    }, [hasFocus, deselectAllIcons]);

    const [isDragging, startDrag, endDrag] = useBoolean(false);
    const [dragRect, setDragRect] = useState({});

    const onDesktopDragStart = (initialPosition: Dimensions) => {
        const { x, y } = toScreenPosition(initialPosition);

        handleMouseDrag({
            initialPosition,
            onMove: (dx, dy) => {
                setDragRect({
                    top: dy < 0 ? y + dy : y,
                    left: dx < 0 ? x + dx : x,
                    width: Math.abs(dx),
                    height: Math.abs(dy),
                });

                // only call this after moving to avoid drawing a rectangle if the user ends up only clicking instead of
                // dragging
                startDrag();

                const dragRectElement = document.getElementById('desktop-drag-rect');
                if (!dragRectElement) return;

                // select all icons which intersect the drag rectangle and deselect all others
                icons.forEach((_, iconPath) => {
                    const iconElement = document.getElementById(`desktop-icon-${iconPath}`); // TODO: see DesktopIcon
                    if (iconElement) {
                        updateIcons({
                            action: 'set',
                            iconPath,
                            value: doRectanglesIntersect(
                                dragRectElement.getBoundingClientRect(),
                                iconElement.getBoundingClientRect(),
                            ),
                        });
                    }
                });
            },
            onDragEnd: endDrag,
        });
    };

    console.log('what', icons);

    return (
        <div
            className="absolute inset-0 z-0"
            onMouseDownCapture={() => {
                focusWindow(wid);

                // reset for the new click event; this happens in the capturing stage so it comes before other
                // reads/writes
                wasIconClicked.current = false;
            }}
        >
            <Wallpaper />
            <div
                onMouseDown={(event) => {
                    // clicks directly on the desktop should always deselect icons and prepare for dragging
                    if (!wasIconClicked.current) {
                        deselectAllIcons();
                        onDesktopDragStart({ x: event.clientX, y: event.clientY });
                    }
                }}
                className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
            >
                {Array.from(icons.entries(), ([path, state]) => {
                    console.log(path);
                    return <DesktopIcon {...state} iconPath={path} key={path} />;
                })}
            </div>
            {isDragging && (
                <div
                    id="desktop-drag-rect"
                    className={`
                        pointer-events-none absolute border border-aero-tint-highlight/25
                        bg-aero-tint-highlight/20
                    `}
                    style={dragRect}
                />
            )}
        </div>
    );
};
