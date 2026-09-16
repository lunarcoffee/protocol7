import { Draft } from 'immer';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useImmerReducer } from 'use-immer';

import { useDirectory } from '@/hooks/filesystem/useDirectory';
import { useFile } from '@/hooks/filesystem/useFile';
import { useBoolean } from '@/hooks/useBoolean';
import { useFocusWindow } from '@/hooks/windows';
import { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';
import { Dimensions, toScreenPosition } from '@/utils/Dimensions';
import { doRectanglesIntersect } from '@/utils/doRectanglesIntersect';
import { FsEntryMetadata } from '@/utils/filesystem';
import { handleMouseDrag } from '@/utils/handleMouseDrag';

import { DesktopIcon } from './DesktopIcon';

const Wallpaper = () => {
    const [file] = useFile('/users/lunarcoffee/pictures/wallpapers/flowers.jpg');
    if (!file?.ok) return null;

    return (
        <div className="absolute size-full bg-aero-tint-darkest object-cover object-center">
            <img
                src={file.objectURL}
                alt="desktop wallpaper"
                draggable={false}
                className="absolute size-full object-cover object-center"
            />
        </div>
    );
};

type IconStates = Map<FsEntryMetadata, boolean>;

type UpdateIconStatesAction =
    | { action: 'set'; iconEntry: FsEntryMetadata; value: boolean }
    | { action: 'set-all'; value: boolean }
    | { action: 'toggle'; iconEntry: FsEntryMetadata }
    | { action: 'replace'; iconStates: IconStates };

const iconStateReducer = (draft: Draft<IconStates>, action: UpdateIconStatesAction) => {
    switch (action.action) {
        case 'set': {
            const { iconEntry, value } = action;
            draft.set(iconEntry, value);
            break;
        }
        case 'set-all': {
            const { value } = action;
            draft.forEach((_, icon) => draft.set(icon, value));
            break;
        }
        case 'toggle': {
            const { iconEntry } = action;
            draft.set(iconEntry, !draft.get(iconEntry));
            break;
        }
        case 'replace': {
            return action.iconStates;
        }
    }
};

export const Desktop = ({ windowInfo: { wid, hasFocus } }: PropsWithWindowInfo) => {
    const focusWindow = useFocusWindow();

    const [dir] = useDirectory('/users/lunarcoffee/desktop');
    const iconFiles = dir?.ok ? Object.values(dir.entries) : [];

    const [iconStates, updateIcons] = useImmerReducer(iconStateReducer, new Map() as IconStates);

    // in the latest mouseDown event, was an icon clicked or just the desktop? this value informs
    // the behavior of mouseDown handlers so they can implement icon selection properly
    const wasIconClicked = useRef(false);

    const [prevIconFiles, setPrevIconFiles] = useState(iconFiles);
    if (iconFiles.length !== prevIconFiles.length) {
        setPrevIconFiles(iconFiles);

        // desktop directory contents changed, reset icons to new default state
        const iconStates = new Map([...iconFiles].map((iconEntry) => [iconEntry, false]));
        updateIcons({ action: 'replace', iconStates });
    }

    // deselect icons on losing focus
    useEffect(() => {
        if (!hasFocus) updateIcons({ action: 'set-all', value: false });
        // reducer dispatches are referentially stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasFocus]);

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

                // we only call this after the cursor moves so we don't draw a rectangle if the user ends up only
                // clicking instead of dragging
                startDrag();

                const dragRectElement = document.getElementById('desktop-drag-rect');
                if (!dragRectElement) return;

                // select all icons which intersect the drag rectangle and deselect all others
                iconStates.forEach((_, iconEntry) => {
                    const iconElement = document.getElementById(`desktop-icon-${iconEntry.path}`); //TODO: hash
                    if (iconElement) {
                        const dragRect = dragRectElement.getBoundingClientRect();
                        const iconRect = iconElement.getBoundingClientRect();
                        updateIcons({ action: 'set', iconEntry, value: doRectanglesIntersect(dragRect, iconRect) });
                    }
                });
            },
            onDragEnd: endDrag,
        });
    };

    const onClickIcon = (iconEntry: FsEntryMetadata) => (event: MouseEvent) => {
        // clicking an icon in multi-select mode (holding control) toggles the selection state; otherwise,
        // it is always set to true
        const isMultiSelect = event.getModifierState('Control');
        if (!isMultiSelect) {
            updateIcons({ action: 'set-all', value: false });
            updateIcons({ action: 'set', iconEntry, value: true });
        } else {
            updateIcons({ action: 'toggle', iconEntry });
        }

        wasIconClicked.current = true;
    };

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
                        updateIcons({ action: 'set-all', value: false });
                        onDesktopDragStart({ x: event.clientX, y: event.clientY });
                    }
                }}
                className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
            >
                {Array.from(iconStates.entries(), ([iconFile, isSelected]) => (
                    <DesktopIcon
                        key={iconFile.path}
                        iconPath={iconFile.path}
                        isSelected={isSelected}
                        onClick={onClickIcon(iconFile)}
                    />
                ))}
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
