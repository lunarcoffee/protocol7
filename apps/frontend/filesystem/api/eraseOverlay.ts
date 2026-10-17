import { promises as fs } from '@zenfs/core';

import { overlayMutex } from '../overlay';

// erases the overlay filesystem for the given host; brings the filesystem back in line with the base
export const eraseOverlay = (hostname: string) =>
    overlayMutex.runExclusive(async () => {
        if (await fs.exists(hostname)) await fs.rm(hostname, { recursive: true });
        await fs.mkdir(hostname);
    });
