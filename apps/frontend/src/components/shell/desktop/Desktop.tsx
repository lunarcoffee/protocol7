import { ContextMenu } from '../controls/ContextMenu';
import { IconDragSelectContainer } from '../controls/iconDragSelectContainer/IconDragSelectContainer';
import { FileManager } from '../fileManager/FileManager';
import { Wallpaper } from './Wallpaper';
import { readDirectory } from '@/filesystem/api/readDirectory';
import { useCreateProcess, useNextProcessID } from '@/hooks/processes';
import { usePromise } from '@/hooks/usePromise';
import { useCreateWindow, useFocusWindow, useNextWindowID } from '@/hooks/windows';
import { escapeMarkdown } from '@/utils/escapeMarkdown';

import type { ListMenuItem } from '../controls/ListMenu';
import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

export const Desktop = ({ winfo }: PropsWithWindowInfo) => {
    const { wid } = winfo;

    const focusWindow = useFocusWindow();
    const nextProcessID = useNextProcessID();
    const nextWindowID = useNextWindowID();
    const createProcess = useCreateProcess();
    const createWindow = useCreateWindow();

    const [dir, refreshDir] = usePromise(() => readDirectory('/users/lunarcoffee/Desktop'), []);
    const iconFiles = dir?.ok ? Object.values(dir.entries) : [];

    const contextMenuItems: ListMenuItem[] = [{ type: 'button', label: 'Refresh', onClick: refreshDir }];

    return (
        <div className="absolute inset-0 z-0" onMouseDown={() => focusWindow(wid)}>
            <Wallpaper />
            <ContextMenu items={contextMenuItems}>
                <IconDragSelectContainer
                    items={iconFiles}
                    itemToKey={({ uid }) => uid}
                    itemToIconProps={({ path, name }) => ({
                        iconEntryPath: path,
                        label: name,
                        tooltip: `*${escapeMarkdown(name)}*`,
                        onClick: async () => {
                            await createProcess({ pid: nextProcessID, pname: 'fileManager' });
                            createWindow({
                                pid: nextProcessID,
                                wid: nextWindowID,
                                size: { x: 700, y: 450 },
                                minSize: { x: 700, y: 450 },
                                render: (pinfo, winfo) => <FileManager pinfo={pinfo} winfo={winfo} />,
                            });
                        },
                    })}
                    deselectOnBlur
                    winfo={winfo}
                />
            </ContextMenu>
        </div>
    );
};
