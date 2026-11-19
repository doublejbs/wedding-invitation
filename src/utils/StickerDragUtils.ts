import type { Point } from '../types/Point';

export const RESTING_OFFSET: Point = { x: 0, y: 0 };

// Horizontal drag of this many px tilts a sticker by one degree.
const PX_PER_DEGREE = 8;

// Offset of a dragged sticker: how far the pointer has moved since the drag started.
export const calculateStickerOffset = (origin: Point, pointer: Point): Point => {
  return { x: pointer.x - origin.x, y: pointer.y - origin.y };
};

export const calculateStickerTilt = (offset: Point) => {
  return offset.x / PX_PER_DEGREE;
};
