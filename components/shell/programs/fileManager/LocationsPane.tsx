import { getSystemIcon } from '@/utils/getSystemIcon';

import { FavoriteLocations } from './FileManager';
import { HeadingText } from './HeadingText';

export interface LocationsPaneProps {
    setCwd: (dir: string) => void;
    locations?: FavoriteLocations;
}

export const LocationsPane = ({ setCwd, locations }: LocationsPaneProps) => {
    return (
        <div
            className="
                w-60 border-r border-aero-tint/40 bg-linear-to-b from-aero-tint-highlight/40 from-30%
                to-aero-tint-highlight p-2 text-xs text-aero-tint-dark text-shadow-none
            "
        >
            <HeadingText className="mb-1 ml-6.5">Favorites</HeadingText>
            {locations ? (
                Array.from(locations.entries()).map(([path, { label, icon }]) => (
                    <div
                        key={path}
                        onClick={() => setCwd(path)}
                        className="
                            flex flex-row gap-1.5 rounded-xs bg-linear-to-b px-1 py-0.5 inset-ring-gray-200
                            outline-aero-tint/40
                            hover:to-aero-tint-highlight hover:inset-ring hover:outline
                        "
                    >
                        <img src={getSystemIcon(icon)} alt={label} width={16} />
                        <p className="text-shadow-2xs text-shadow-white">{label}</p>
                    </div>
                ))
            ) : (
                // TODO: better placeholder
                <p>Loading...</p>
            )}
        </div>
    );
};
