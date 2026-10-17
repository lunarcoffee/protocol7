import { getShellRootElement } from './getShellRootElement';

import type { Dimensions } from './Dimensions';

export const toScreenPosition = ({ x, y }: Dimensions) => {
    const [{ top, left }] = Array.from(getShellRootElement()!.getClientRects());
    return { x: x - left, y: y - top };
};
