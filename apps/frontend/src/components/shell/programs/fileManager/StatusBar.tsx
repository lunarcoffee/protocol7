import { formatSizeBytes } from '@/utils/formatSizeBytes';
import { pluralize } from '@/utils/pluralize';

import type { ReadDirectoryResult } from '@/filesystem/api/readDirectory';
import type { FsFileMetadata } from '@protocol7/filesystem-types';

export interface StatusBarProps {
    dir?: ReadDirectoryResult;
}

export const StatusBar = ({ dir }: StatusBarProps) => {
    const entries = Object.values(dir?.ok ? dir.entries : {});

    const files = entries.filter((entry): entry is FsFileMetadata => entry.type === 'file');
    const dirs = entries.filter(({ type }) => type === 'directory');

    const totalFileSize = files.reduce((total, { size }) => total + size, 0);

    let contentsText = [
        files.length > 0 &&
            `${files.length} ${pluralize('file', files.length)} (total ${formatSizeBytes(totalFileSize)})`,
        dirs.length > 0 && `${dirs.length} ${pluralize('folder', dirs.length)}`,
        files.length + dirs.length === 0 && 'Empty folder',
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <div
            className="
                flex h-6 w-full items-center p-2 text-xs text-aero-tint-dark text-shadow-2xs
                text-shadow-white/80
            "
        >
            {dir?.ok && <p>{contentsText}</p>}
            <div className="flex-1" />
            {/*TODO: link to actual state now that it exists*/}
            <p>0 selected</p>
        </div>
    );
};
