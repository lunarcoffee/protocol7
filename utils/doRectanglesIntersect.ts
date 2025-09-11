interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const doRectanglesIntersect = (r1: Rectangle, r2: Rectangle) =>
  r2.left <= r1.right &&
  r2.right >= r1.left &&
  r2.top <= r1.bottom &&
  r2.bottom >= r1.top;
