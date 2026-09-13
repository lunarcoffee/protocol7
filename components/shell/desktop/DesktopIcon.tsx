import { MouseEvent } from 'react';

import { useFile } from '@/hooks/filesystem/useFile';
import { useCreateProcess, useNextProcessID } from '@/hooks/processes';
import { useCreateWindow, useNextWindowID } from '@/hooks/windows';
import { twMergeClsx } from '@/utils/twMergeClsx';

import { WindowFrame } from '../windows/WindowFrame';

export interface DesktopIconProps {
    iconPath: string;
    isSelected: boolean;
    onClick: (event: MouseEvent) => void;
}

// TODO: tooltip on hover

export const DesktopIcon = ({ iconPath, isSelected, onClick }: DesktopIconProps) => {
    const nextProcessID = useNextProcessID();
    const nextWindowID = useNextWindowID();
    const createProcess = useCreateProcess();
    const createWindow = useCreateWindow();

    const [iconFile] = useFile(iconPath);
    if (!iconFile?.ok) return null;

    const { name: label, pathHash } = iconFile;

    return (
        <div
            id={`desktop-icon-${pathHash}`}
            className={twMergeClsx(
                `
                    flex h-fit w-20 flex-col items-center gap-1.5 overflow-visible rounded-xs pt-1
                    hover:bg-aero-tint-highlight/25 hover:shadow-[0_0_4px] hover:ring
                    hover:shadow-aero-tint-highlight/25 hover:ring-aero-tint-highlight/25
                `,
                isSelected &&
                    `
                        bg-aero-tint-highlight/45 shadow-[0_0_4px] ring shadow-aero-tint-highlight/45
                        ring-aero-tint-highlight/45
                        hover:bg-aero-tint-highlight/55 hover:ring hover:shadow-aero-tint-highlight/55
                        hover:ring-aero-tint-highlight/55
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
                    flex size-15 items-center justify-center drop-shadow-sm drop-shadow-aero-tint-darkest/70
                "
            >
                <img src={iconFile.contentsAsObjectURL} alt={label} draggable={false} />
            </div>
            <div className="flex w-20 justify-center overflow-visible">
                <p
                    className={twMergeClsx(
                        `
                            px-0.5 pb-0.5 text-center text-xs wrap-break-word text-shadow-aero-tint-darkest
                            text-shadow-md
                        `,
                        isSelected ? 'line-clamp-4' : 'line-clamp-2',
                    )}
                >
                    {label}
                </p>
            </div>
        </div>
    );
};
