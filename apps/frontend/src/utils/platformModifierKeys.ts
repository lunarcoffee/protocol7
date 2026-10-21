import Bowser from 'bowser';

import type { ModifierKey } from 'react';

const browser = Bowser.getParser(window.navigator.userAgent);
const isMac = browser.getOSName().startsWith('mac');

export const platformModifierKeys: Record<string, ModifierKey> = {
    MULTI_SELECT: isMac ? 'Meta' : 'Control',
    RANGE_SELECT: 'Shift',
};
