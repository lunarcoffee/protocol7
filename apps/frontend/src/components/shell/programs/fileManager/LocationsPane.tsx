import path from 'path-browserify';

import { HeadingText } from './HeadingText';
import { usePromise } from '@/hooks/usePromise';
import { getIconForEntry } from '@/utils/getIconForEntry';
import { getSystemIcon } from '@/utils/getSystemIcon';

import type { SavedLocations } from './FileManager';

interface LocationListEntryProps {
    path: string;
    iconUrl: string;
    label: string;

    setCwd: (dir: string) => void;
}

const LocationListEntry = ({ path, iconUrl, label, setCwd }: LocationListEntryProps) => (
    <div
        key={path}
        onClick={() => setCwd(path)}
        className="
            flex flex-row items-start gap-1.5 rounded-xs bg-linear-to-b px-1 py-0.5 inset-ring-gray-200
            outline-aero-tint/40
            hover:from-white/50 hover:to-aero-tint-highlight hover:inset-ring hover:outline
        "
    >
        <img src={iconUrl} alt={label} width={16} />
        <p className="line-clamp-2 overflow-hidden text-shadow-2xs text-shadow-white">{label}</p>
    </div>
);

const LoadingPlaceholder = () => <p className="m-2 text-center text-aero-tint/50">Loading...</p>;

export interface LocationsPaneProps {
    setCwd: (dir: string) => void;
    locations?: SavedLocations;
    favorites?: string[];
}

export const LocationsPane = ({ setCwd, locations, favorites }: LocationsPaneProps) => {
    const [favoritesIcons] = usePromise(() => Promise.all(favorites?.map(getIconForEntry) ?? []), [favorites]);
    const areFavoritesLoaded = favorites && favoritesIcons?.length === favorites.length;

    return (
        <div
            className="
                w-50 grow-0 scrollbar-none overflow-y-scroll overscroll-none p-2 text-xs text-aero-tint-dark
                text-shadow-none
            "
        >
            <HeadingText className="mb-1 ml-6.5">Places</HeadingText>
            {locations ? (
                Array.from(locations.entries()).map(([path, { label, icon }]) => (
                    <LocationListEntry
                        key={path}
                        path={path}
                        label={label}
                        iconUrl={getSystemIcon(icon)}
                        setCwd={setCwd}
                    />
                ))
            ) : (
                <LoadingPlaceholder />
            )}

            <div className="mx-1 my-1.5 border-y border-t-aero-tint/30 border-b-white" />
            {areFavoritesLoaded ? (
                favorites.map((entryPath, i) => (
                    <LocationListEntry
                        key={entryPath}
                        path={entryPath}
                        label={path.basename(entryPath)}
                        iconUrl={favoritesIcons[i].objectURL}
                        setCwd={setCwd}
                    />
                ))
            ) : (
                <LoadingPlaceholder />
            )}
        </div>
    );
};
