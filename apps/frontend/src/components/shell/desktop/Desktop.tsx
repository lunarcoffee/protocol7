import { useEffect, useState } from 'react';

import { ContextMenu } from '../controls/ContextMenu';
import { DragSelectContainer } from '../controls/DragSelectContainer';
import { DesktopIcon } from './DesktopIcon';
import { readDirectory } from '@/filesystem/api/readDirectory';
import { readFile } from '@/filesystem/api/readFile';
import { useDragSelectReducer } from '@/hooks/useDragSelectReducer';
import { usePromise } from '@/hooks/usePromise';
import { useFocusWindow } from '@/hooks/windows';
import { shallowArrayEquals } from '@/utils/shallowArrayEquals';

import type { ListMenuItem } from '../controls/ListMenu';
import type { ShellSettings } from '@/hooks/processes/useShellProcessSettings';
import type { PropsWithProcessInfo } from '@/stores/system/processes/ProcessManager';
import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

const Wallpaper = ({ pinfo }: PropsWithProcessInfo) => {
    const { wallpaperPath } = pinfo.getSettings<ShellSettings>();

    const [file] = usePromise(() => readFile(wallpaperPath), [wallpaperPath]);
    if (!file?.ok) return null;

    return (
        <div className="absolute size-full bg-aero-tint-darkest object-cover object-center">
            <img
                src={file.getObjectURL()}
                alt="desktop wallpaper"
                draggable={false}
                onContextMenu={() => {}}
                className="absolute size-full object-cover object-center"
            />
        </div>
    );
};

export type DesktopProps = PropsWithWindowInfo & PropsWithProcessInfo;

export const Desktop = ({ winfo: { wid, hasFocus }, pinfo }: DesktopProps) => {
    const focusWindow = useFocusWindow();

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

    const contextMenuItems: ListMenuItem[] = [
        { type: 'button', label: 'test', onClick: () => {} },
        { type: 'button', label: 'test 2', icon: 'devices/drive-harddisk.png', onClick: () => {} },
        {
            type: 'submenu',
            label: 'longer item name that ',
            subItems: [
                { type: 'button', label: 'subitem 1', onClick: () => {} },
                { type: 'button', label: 'subitem 2', icon: 'devices/drive-disc.png', onClick: () => {} },
            ],
        },
        { type: 'separator' },
        { type: 'button', label: 'test 3', icon: 'places/folder.png', onClick: () => {} },
    ];

    return (
        <div className="absolute inset-0 z-0" onMouseDown={() => focusWindow(wid)}>
            <Wallpaper pinfo={pinfo} />
            <ContextMenu items={contextMenuItems}>
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
            </ContextMenu>
        </div>
    );
};
