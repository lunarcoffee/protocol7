import { eraseOverlay } from '@/filesystem/api/eraseOverlay';
import { fetchManifest } from '@/filesystem/manifest';
import { usePromise } from '@/hooks/usePromise';
import { createSystemStore, SystemStoreAPI } from '@/stores/system/store';

export let systemStore: SystemStoreAPI | null = null;

export const useInitializeSystem = (hostname: string) => {
    const [isSystemReady] = usePromise(async () => {
        try {
            await eraseOverlay(hostname);
        } catch (err) {
            console.error(`fs: exception while erasing overlay for host ${hostname}!`, err);
            return false;
        }
        const fileManifest = await fetchManifest(hostname);

        if (fileManifest) systemStore = createSystemStore(hostname, fileManifest);
        return !!fileManifest;
    }, [hostname]);

    return isSystemReady;
};
