import { Dimensions } from './Dimensions';

let mousePosition: Dimensions;

// call on app initialization
export const addMousePositionListener = () => {
    document.addEventListener(
        'mousemove',
        ({ clientX, clientY }) => {
            mousePosition = { x: clientX, y: clientY };
        },
        true,
    );
};

export const getMousePosition = () => mousePosition;
