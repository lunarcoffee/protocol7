import { promises as fs } from '@zenfs/core';
import { Mutex } from 'async-mutex';

/* TODO:
 * this module contains an implementation of a union mount filesystem consisting of two filesystems: a base and an
 * overlay. when an entry is present in both filesystems, the overlay always takes precedence. deletion of files in the
 * base is implemented using the metadata files associated with the deleted entries.
 *
 * the base filesystem is the same for all clients and is stored on the remote server, with each client retaining a copy
 * of only the metadata of the system (`FsManifest`). the actual content is never persisted locally; it is always
 * fetched on-demand to allow for efficient initial loading. the overlay uses zen-fs with an IndexedDB backend (see the
 * interface `System`) and is stored entirely on the client.
 *
 * both the remote and local filesystems contain a metadata and data file (or just the directory) for each entry; an
 * example of a base and overlay directory structure is shown below:
 *
 * localhost/                                  (base)
 *  |- system_info.metadata
 *  |- system_info.data
 *  |- usr.metadata
 *  |- usr.dir/
 *  |   |- sandbox.data.metadata
 *  |   |- sandbox.data.data
 *  |   |- Music.metadata
 *  |   +- Music.data/
 *  |       |- wilt - nothing special.mp3.metadata
 *  |       +- wilt - nothing special.mp3.data
 *  |- var.metadata
 *  +- var.data/
 *      |- lock.metadata
 *      |- lock.data
 *      |- lib.metadata
 *      +- lib.data/
 *
 * localhost/                                  (overlay)
 *  |- usr.metadata
 *  |- usr.dir/
 *  |   |- Music.metadata
 *  |   +- Music.data/
 *  |       |- wilt - without you.mp3.metadata
 *  |       +- wilt - without you.mp3.data
 *  |- var.metadata
 *  +- var.data/
 *      |- lock.metadata                       (containing { type: 'deleted' })
 *      |- lib.metadata                        (containing { type: 'file' })
 *      +- lib.data
 *
 * this module's goal is to expose a simple, transparent, and acceptably performant API that integrates well with the
 * rest of the app. a client's view of the example above should be:
 *
 * localhost/                                  (client)
 *  |- system_info
 *  |- usr/
 *  |   |- sandbox.data
 *  |   +- Music/                              (contents merged)
 *  |       |- wilt - nothing special.mp3
 *  |       +- wilt - without you.mp3
 *  +- var/                                    (`/var/lock` is gone)
 *      +- lib                                 (a regular file)
 */

export type FsCommonMetadata = { name: string; path: string };
export type FsTimeMetadata = { created: string; modified: string };

export type FsFileMetadata = { type: 'file'; extension: string } & FsCommonMetadata & FsTimeMetadata;
export type FsDirectoryMetadata = { type: 'directory' } & FsCommonMetadata & FsTimeMetadata;

// this is only used to override the existence of an entry present in the base
export type FsDeletedMetadata = { type: 'deleted' } & FsCommonMetadata;

export type FsEntryMetadata = FsFileMetadata | FsDirectoryMetadata | FsDeletedMetadata;

const resetOverlayMutex = new Mutex();

// erases the overlay filesystem for the given host
export const resetOverlay = async (hostname: string) => {
    try {
        await resetOverlayMutex.runExclusive(async () => {
            if (await fs.exists(hostname)) await fs.rm(hostname, { recursive: true });
            await fs.mkdir(hostname);
        });
    } catch (err) {
        console.error(`exception while resetting local filesystem for host ${hostname}!`, err);
    }
};
