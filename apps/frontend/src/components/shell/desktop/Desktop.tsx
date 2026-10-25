import { useEffect, useState } from 'react';

import { DragSelectContainer } from '../controls/DragSelectContainer';
import { DesktopIcon } from './DesktopIcon';
import { readDirectory } from '@/filesystem/api/readDirectory';
import { readFile } from '@/filesystem/api/readFile';
import { useDragSelectReducer } from '@/hooks/useDragSelectReducer';
import { usePromise } from '@/hooks/usePromise';
import { useFocusWindow } from '@/hooks/windows';
import { shallowArrayEquals } from '@/utils/shallowArrayEquals';

import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

const Wallpaper = () => {
    // TODO: get wallpaper from system settings eventually
    const name = 'leaves';
    const [file] = usePromise(() => readFile(`/users/lunarcoffee/Pictures/wallpapers/${name}.jpg`), [name]);
    if (!file?.ok) return null;

    return (
        <div className="absolute size-full bg-aero-tint-darkest object-cover object-center">
            <img
                src={file.getObjectURL()}
                alt="desktop wallpaper"
                draggable={false}
                className="absolute size-full object-cover object-center"
            />
        </div>
    );
};

export const Desktop = ({ winfo: { wid, hasFocus } }: PropsWithWindowInfo) => {
    const focusWindow = useFocusWindow();

    // TODO: can use refresh trigger to implement refresh context menu option
    const [dir] = usePromise(() => readDirectory('/users/lunarcoffee/Desktop'), []);
    const iconFiles = dir?.ok ? Object.values(dir.entries) : [];

    const [iconStates, updateIcons] = useDragSelectReducer<number>();

    const [prevIconFiles, setPrevIconFiles] = useState(iconFiles);
    if (!shallowArrayEquals(iconFiles, prevIconFiles)) {
        setPrevIconFiles(iconFiles);

        // desktop directory contents changed, reset icons to new default state
        const newStates = new Map([...iconFiles].map((iconEntry) => [iconEntry.uid, false]));
        updateIcons({ action: 'replace', newStates });
    }

    // deselect icons on losing focus
    useEffect(() => {
        if (!hasFocus) updateIcons({ action: 'set-all', value: false });
    }, [hasFocus, updateIcons]);

    return (
        <div className="absolute inset-0 z-0" onMouseDown={() => focusWindow(wid)}>
            <Wallpaper />
            <DragSelectContainer
                itemStates={iconStates}
                updateItems={updateIcons}
                renderItem={(key, isSelected, onClick) => {
                    const { path } = iconFiles.find(({ uid }) => uid === key)!;
                    return <DesktopIcon key={key} iconPath={path} isSelected={isSelected} onClick={onClick} />;
                }}
                className="absolute flex size-full flex-row flex-wrap gap-2 p-1"
                uniqueId="desktop"
            />
        </div>
    );
};
