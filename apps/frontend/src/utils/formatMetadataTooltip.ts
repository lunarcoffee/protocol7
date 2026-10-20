import dedent from 'dedent';

import { escapeMarkdown } from './escapeMarkdown';
import { formatSizeBytes } from './formatSizeBytes';
import { formatTimestampFull } from './formatTimestamp';

import type { FsEntryMetadata } from '@protocol7/filesystem-types';

export const formatMetadataTooltip = (metadata: FsEntryMetadata) => {
    const { type, name, created, modified } = metadata;
    const isFile = type === 'file';

    const createdTime = formatTimestampFull(created);
    const modifiedTime = formatTimestampFull(modified);

    return dedent`
        *${escapeMarkdown(name)}*

        ${isFile ? `Uses **${formatSizeBytes(metadata.size)}** on disk` : ''}
        **Created** on ${createdTime}
        ${modifiedTime !== createdTime ? `**Last modified** on ${modifiedTime}` : ''}
    `;
};
