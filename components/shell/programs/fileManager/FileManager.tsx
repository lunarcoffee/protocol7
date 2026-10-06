import { useState } from 'react';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readFile } from '@/filesystem/api/readFile';
import { usePromise } from '@/hooks/usePromise';
import { PropsWithWindowInfo } from '@/stores/system/windows/WindowManager';

import { WindowFrame } from '../../windows/WindowFrame';
import { ControlBar } from './ControlBar';
import { FileTable } from './FileTable';
import { LocationsPane } from './LocationsPane';

export type FavoriteLocation = { label: string; icon: string };
export type FavoriteLocations = Map<string, FavoriteLocation>;

export const FAVORITE_LOCATIONS_PATH = '/system/programs/fileManager/locations.json';

export const FileManager = ({ windowInfo }: PropsWithWindowInfo) => {
    const [cwd, setCwd] = useState('/');

    // subcomponents always assume this will eventually resolve to a valid directory
    // TODO: ensure this never gets set to a directory that doesn't exist
    const [dir] = usePromise(() => readDirectory(cwd), [cwd]);

    const [locations] = usePromise(async () => {
        const file = await readFile(FAVORITE_LOCATIONS_PATH);
        if (file?.ok) {
            const contents = new TextDecoder().decode(await file.contents());
            const locations = JSON.parse(contents) as Record<string, FavoriteLocation>;
            return new Map(Object.entries(locations));
        }
    }, []);

    return (
        <WindowFrame windowInfo={windowInfo}>
            <div className="flex size-full min-h-0 min-w-0 flex-col bg-gray-100">
                <ControlBar cwd={cwd} setCwd={setCwd} />
                <div className="flex size-full min-h-0 flex-row">
                    <LocationsPane setCwd={setCwd} locations={locations} />
                    <FileTable setCwd={setCwd} dir={dir} locations={locations} />
                </div>
            </div>
        </WindowFrame>
    );
};
