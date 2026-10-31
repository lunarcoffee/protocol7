import { useSystemStore } from '../system/useSystemStore';
import { PID_SHELL, type ProcessSettings } from '@/stores/system/processes/ProcessManager';

export interface ShellSettings {
    wallpaperPath: string;
    tooltipDelay: number;
}

export const useShellProcessSettings = <T>(selector: (settings: ProcessSettings<ShellSettings>) => T): T =>
    useSystemStore(({ pm }) => selector(pm.processes.get(PID_SHELL)!.getSettings<ShellSettings>()));
