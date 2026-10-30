import { WindowFrame } from '../windowFrame/WindowFrame';
import { ControlBar } from './ControlBar';
import { FileTable } from './FileTable';
import { LocationsPane } from './LocationsPane';
import { StatusBar } from './StatusBar';
import { FileManagerContextProvider } from './store/FileManagerContext';
import { useFileManagerStore } from './store/useFileManagerStore';
import { usePromise } from '@/hooks/usePromise';

import type { PropsWithProcessInfo } from '@/stores/system/processes/ProcessManager';
import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

export type FileManagerProps = PropsWithWindowInfo & PropsWithProcessInfo;

export const FileManager = ({ pinfo, winfo }: FileManagerProps) => (
    <FileManagerContextProvider pinfo={pinfo}>
        <FileManagerWindow pinfo={pinfo} winfo={winfo} />
    </FileManagerContextProvider>
);

const FileManagerWindow = ({ pinfo, winfo }: FileManagerProps) => {
    const refresh = useFileManagerStore(({ refresh }) => refresh);

    usePromise(() => refresh(), [refresh]);

    return (
        <WindowFrame pinfo={pinfo} winfo={winfo}>
            <div className="size-full bg-gray-100">
                <div
                    className="
                        relative flex size-full min-h-0 min-w-0 flex-col bg-linear-to-b
                        from-aero-tint-highlight/40 from-30% to-aero-tint-highlight
                    "
                >
                    <ControlBar />
                    <div className="flex min-h-0 w-full flex-1 flex-row">
                        <LocationsPane />
                        <FileTable winfo={winfo} />
                    </div>
                    <StatusBar />
                </div>
            </div>
        </WindowFrame>
    );
};
