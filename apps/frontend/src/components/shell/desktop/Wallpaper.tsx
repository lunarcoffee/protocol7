import { readFile } from '@/filesystem/api/readFile';
import { useShellProcessSettings } from '@/hooks/processes';
import { usePromise } from '@/hooks/usePromise';

export const Wallpaper = () => {
    const wallpaperPath = useShellProcessSettings(({ wallpaperPath }) => wallpaperPath);

    const [file] = usePromise(() => readFile(wallpaperPath), [wallpaperPath]);
    if (!file?.ok) return null;

    return (
        <div className="absolute size-full bg-aero-tint-darkest object-cover object-center">
            <img
                src={file.getObjectURL()}
                draggable={false}
                onContextMenu={() => {}}
                className="absolute size-full object-cover object-center"
            />
        </div>
    );
};
