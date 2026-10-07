import { useState } from 'react';

import { readDirectory } from '@/filesystem/api/readDirectory';
import { readFile } from '@/filesystem/api/readFile';
import { readMetadata } from '@/filesystem/api/readMetadata';
import { normalizePath } from '@/filesystem/internal';
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
            <div className="relative flex size-full min-h-0 min-w-0 flex-col bg-gray-100">
                {/* fills in the leaking background color behind the control bar's rounded corner */}
                <div className="absolute top-0 left-0 size-9.5 bg-aero-tint-highlight/40" />
                <ControlBar cwd={cwd} setCwd={setNextCwd} />

                <div className="flex size-full min-h-0 flex-row">
                    <LocationsPane setCwd={setNextCwd} locations={locations} />
                    <FileTable setCwd={setNextCwd} dir={dir} locations={locations} />
                </div>
            </div>
        </WindowFrame>
    );
};
