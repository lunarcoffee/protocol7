import { useFileManagerStore } from './store/useFileManagerStore';
import { formatSizeBytes } from '@/utils/formatSizeBytes';
import { pluralize } from '@/utils/pluralize';

import type { FsFileMetadata } from '@protocol7/filesystem-types';

export const StatusBar = () => {
    const dir = useFileManagerStore(({ dir }) => dir);
    const selectionStates = useFileManagerStore(({ selectionStates }) => selectionStates);

    const entries = Object.values(dir?.ok ? dir.entries : {});
    const selectedEntries = Array.from(selectionStates.values()).filter(Boolean);

    const files = entries.filter((entry): entry is FsFileMetadata => entry.type === 'file');
    const dirs = entries.filter(({ type }) => type === 'directory');

    const totalFileSize = files.reduce((total, { size }) => total + size, 0);

    const contentsText = [
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
            <p>{selectedEntries.length} selected</p>
        </div>
    );
};
