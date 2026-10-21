import { useState } from 'react';

import { WindowFrame } from '../../windows/WindowFrame';
import { ControlBar } from './ControlBar';
import { FileTable } from './FileTable';
import { LocationsPane } from './LocationsPane';
import { StatusBar } from './StatusBar';
import { readDirectory } from '@/filesystem/api/readDirectory';
import { readFile } from '@/filesystem/api/readFile';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';
import { usePromise } from '@/hooks/usePromise';

import type { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

export type SavedLocation = { label: string; icon: string };
export type SavedLocations = Map<string, SavedLocation>;

// TODO: use settings API once implemented
export const LOCATIONS_PATH = '/system/programs/fileManager/locations.json';
export const FAVORITES_PATH = '/system/programs/fileManager/favorites.json';

export const FileManager = ({ windowInfo }: PropsWithWindowInfo) => {
    // `cwd` is the actual current working directory; children call `setNextCwd` to request a new `cwd`
    const [cwd, setCwd] = useState('/');
    const [nextCwd, setNextCwd] = useState(cwd);

    // before updating the actual `cwd`, check if `nextCwd` is a valid directoy; it has to happen this way because
    // reading metadata is async
    const [nextCwdMetadata] = usePromise(() => readMetadata(nextCwd), [nextCwd]);
    if (
        cwd !== nextCwd &&
        nextCwdMetadata?.ok &&
        nextCwdMetadata.metadata.path === normalizePath(nextCwd) &&
        nextCwdMetadata.metadata.type === 'directory'
    ) {
        setCwd(nextCwd);
    }

    // meanwhile, this value is always pending or valid
    const [dir] = usePromise(() => readDirectory(cwd), [cwd]);

    // TODO: api for reading json config data into a type? maybe w zod for validation
    const [locations] = usePromise(async () => {
        const file = await readFile(LOCATIONS_PATH);
        if (!file?.ok) return undefined;

        const contents = new TextDecoder().decode(await file.contents());
        const locations = JSON.parse(contents) as Record<string, SavedLocation>;
        return new Map(Object.entries(locations));
    }, []);

    const [favorites] = usePromise(async () => {
        const file = await readFile(FAVORITES_PATH);
        if (!file?.ok) return undefined;

        const contents = new TextDecoder().decode(await file.contents());
        return JSON.parse(contents) as string[];
    }, []);

    return (
        <WindowFrame windowInfo={windowInfo}>
            <div className="size-full bg-gray-100">
                <div
                    className="
                        relative flex size-full min-h-0 min-w-0 flex-col bg-linear-to-b
                        from-aero-tint-highlight/40 from-30% to-aero-tint-highlight
                    "
                >
                    <ControlBar cwd={cwd} setCwd={setNextCwd} locations={locations} />
                    <div className="flex min-h-0 w-full flex-1 flex-row">
                        <LocationsPane setCwd={setNextCwd} locations={locations} favorites={favorites} />
                        <FileTable setCwd={setNextCwd} dir={dir} locations={locations} wid={windowInfo.wid} />
                    </div>
                    <StatusBar dir={dir} />
                </div>
            </div>
        </WindowFrame>
    );
};
