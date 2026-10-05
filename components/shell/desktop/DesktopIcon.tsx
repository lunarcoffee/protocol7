import dedent from 'dedent';
import { MouseEvent } from 'react';

import { Tooltip } from '@/components/shell/controls/Tooltip';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { useCreateProcess, useNextProcessID } from '@/hooks/processes';
import { usePromise } from '@/hooks/usePromise';
import { useCreateWindow, useNextWindowID } from '@/hooks/windows';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { WindowFrame } from '../windows/WindowFrame';

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

    const [iconImageUrl] = usePromise(() => getIconForEntry(iconPath), [iconPath]);
    const [iconFile] = usePromise(() => readMetadata(iconPath), [iconPath]);

    if (!iconFile?.ok) return null;

    const { name: label, uid, created, modified } = iconFile.metadata;

    const createdTime = formatTimestamp(created);
    const modifiedTime = formatTimestamp(modified);
    const tooltipLabel = dedent`
        *${label}*

        **Created** on ${createdTime}
        ${modifiedTime !== createdTime ? `**Last modified** on ${modifiedTime}` : ''}
    `;

    return (
        <Tooltip label={tooltipLabel} className="h-fit">
        <div
            id={`desktop-icon-${uid}`}
            className={twMergeClsx(
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
            onDoubleClick={() => {
                createProcess({ pid: nextProcessID });
                createWindow({
                    pid: nextProcessID,
                    wid: nextWindowID,
                    title: label,
                    size: { x: 800, y: 500 },
                    render: (windowInfo) => (
                        <WindowFrame windowInfo={windowInfo}>
                            <div className="size-full bg-gray-100 p-4">
                                <p className="text-sm text-blue-900 text-shadow-none">this is a window!</p>
                            </div>
                        </WindowFrame>
                    ),
                });
            }}
        >
            <div
                className="
                        flex size-15 items-center justify-center drop-shadow-sm
                        drop-shadow-aero-tint-darkest/70
                "
            >
                    {iconImageUrl && <img src={iconImageUrl} alt={label} draggable={false} />}
            </div>
            <div className="flex w-20 justify-center overflow-visible">
                <p
                    className={twMergeClsx(
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
