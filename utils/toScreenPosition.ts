import { Dimensions } from './Dimensions';
import { getShellRootElement } from './getShellRootElement';

export const toScreenPosition = ({ x, y }: Dimensions) => {
    const [{ top, left }] = getShellRootElement()!.getClientRects();
    return { x: x - left, y: y - top };
};
