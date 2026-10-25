import { cn } from 'cn';

import { Tooltip } from '@/components/shell/controls/Tooltip';
import { FileManager } from '@/components/shell/programs/fileManager/FileManager';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { useCreateProcess, useNextProcessID } from '@/hooks/processes';
import { usePromise } from '@/hooks/usePromise';
import { useCreateWindow, useNextWindowID } from '@/hooks/windows';
import { escapeMarkdown } from '@/utils/escapeMarkdown';
import { getIconForEntry } from '@/utils/getIconForEntry';

import type { MouseEvent } from 'react';

export interface DesktopIconProps {
    iconPath: string;
    isSelected: boolean;
    onClick: (event: MouseEvent) => void;
}

export const DesktopIcon = ({ iconPath, isSelected, onClick }: DesktopIconProps) => {
    const nextProcessID = useNextProcessID();
    const nextWindowID = useNextWindowID();
    const createProcess = useCreateProcess();
    const createWindow = useCreateWindow();

    const [iconImage] = usePromise(() => getIconForEntry(iconPath), [iconPath]);
    const [iconFile] = usePromise(() => readMetadata(iconPath), [iconPath]);

    if (!iconFile?.ok) return null;

    const { name: label, uid } = iconFile.metadata;
    const tooltipLabel = `*${escapeMarkdown(label)}*`;

    return (
        <Tooltip label={tooltipLabel} className="h-fit">
            <div
                id={`drag-select-container-desktop-item-${uid}`}
                className={cn(
                    `
                        flex w-20 flex-col items-center gap-1.5 overflow-visible rounded-xs pt-1
                        hover:bg-aero-tint-highlight/25 hover:shadow-[0_0_4px]
                        hover:shadow-aero-tint-highlight/25 hover:outline hover:outline-aero-tint-highlight/25
                    `,
                    isSelected &&
                        `
                            bg-aero-tint-highlight/45 shadow-[0_0_4px] shadow-aero-tint-highlight/45 outline
                            outline-aero-tint-highlight/45
                            hover:bg-aero-tint-highlight/55 hover:shadow-aero-tint-highlight/55 hover:outline
                            hover:outline-aero-tint-highlight/55
                        `,
                )}
                onMouseDown={onClick}
                onDoubleClick={async () => {
                    await createProcess({ pid: nextProcessID, pname: 'fileManager' });
                    createWindow({
                        pid: nextProcessID,
                        wid: nextWindowID,
                        title: 'File Manager',
                        size: { x: 700, y: 450 },
                        minSize: { x: 700, y: 450 },
                        render: (pinfo, winfo) => <FileManager pinfo={pinfo} winfo={winfo} />,
                    });
                }}
            >
                <div
                    className="
                        flex size-15 items-center justify-center drop-shadow-sm
                        drop-shadow-aero-tint-darkest/70
                    "
                >
                    {iconImage && <img src={iconImage.objectURL} alt={label} draggable={false} />}
                </div>
                <div className="flex w-20 justify-center overflow-visible">
                    <p
                        className={cn(
                            `
                                px-0.5 pb-0.5 text-center text-xs wrap-break-word
                                text-shadow-aero-tint-darkest text-shadow-md
                            `,
                            isSelected ? 'line-clamp-4' : 'line-clamp-2',
                        )}
                    >
                        {label}
                    </p>
                </div>
            </div>
        </Tooltip>
    );
};
