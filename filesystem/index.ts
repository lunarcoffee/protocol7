/*
 * this module contains an implementation of a union mount filesystem consisting of two logical filesystems: a read-only
 * 'base' and a writeable 'overlay'. when an entry is present in both filesystems, the overlay takes precedence.
 *
 * the base filesystem is the same for all clients and is stored on the remote server, with each client retaining a copy
 * of only the metadata (`FsManifest`). the actual content is not persisted locally; contents are fetched on-demand to
 * optimize network usage. the overlay uses zen-fs with an IndexedDB backend (see the interface `System`) and is stored
 * entirely in the client's browser.
 *
 * both the remote and local filesystems contain a metadata and data file (or just the directory) for each individual
 * entry; examples of base and overlay filesystems are shown below:
 *
 * localhost/                                  (base)
 *  |- system_info.metadata
 *  |- system_info.data
 *  |- usr.metadata
 *  |- usr.data/
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
 *          |- logrotate.status.metadata
 *          +- logrotate.status.data
 *
 * localhost/                                  (overlay)
 *  |- usr.metadata
 *  |- usr.data/
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
 * a client's view of the above example through the API exposed by this module should be:
 *
 * localhost/                                  (client)
 *  |- system_info
 *  |- usr/
 *  |   |- sandbox.data
 *  |   +- Music/                              (contents merged)
 *  |       |- wilt - nothing special.mp3
 *  |       +- wilt - without you.mp3
 *  +- var/                                    (`/var/lock` is gone)
 *      +- lib                                 (a regular file; note that `/var/lib/logrotate.stats` is gone)
 *
 * note: functions in this module which take paths as arguments will identify the expected type of entry in the
 * parameter name; `filePath` indicates a file, `dirPath` indicates a directory, and `entryPath` indicates that either
 * is acceptable.
 */

/* client-facing metadata types */

export type FsCommonMetadata = { name: string; path: string };
export type FsTimeMetadata = { created: string; modified: string };

export type FsFileMetadata = { type: 'file'; extension: string } & FsCommonMetadata & FsTimeMetadata;
export type FsDirectoryMetadata = { type: 'directory' } & FsCommonMetadata & FsTimeMetadata;

export type FsEntryMetadata = FsFileMetadata | FsDirectoryMetadata;

/* metadata as stored in the overlay */

export type OverlayFileMetadata = { type: 'file'; extension: string; source?: string } & FsTimeMetadata;
export type OverlayDirectoryMetadata = { type: 'directory'; isOpaque?: boolean; source?: string } & FsTimeMetadata;
export type OverlayDeletedMetadata = { type: 'deleted' };

export type OverlayEntryMetadata = OverlayFileMetadata | OverlayDirectoryMetadata | OverlayDeletedMetadata;
