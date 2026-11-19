import {
  calculateStickerOffset,
  calculateStickerTilt,
  RESTING_OFFSET,
} from '../utils/StickerDragUtils';

describe('StickerDragUtils', () => {
  it('follows the pointer relative to where the drag started', () => {
    expect(calculateStickerOffset({ x: 100, y: 100 }, { x: 140, y: 70 })).toEqual({ x: 40, y: -30 });
  });

  it('rests at zero offset', () => {
    expect(RESTING_OFFSET).toEqual({ x: 0, y: 0 });
    expect(calculateStickerOffset({ x: 12, y: 8 }, { x: 12, y: 8 })).toEqual(RESTING_OFFSET);
  });

  it('tilts by one degree per 8px of horizontal offset', () => {
    expect(calculateStickerTilt({ x: 40, y: 0 })).toBe(5);
    expect(calculateStickerTilt({ x: -16, y: 30 })).toBe(-2);
    expect(calculateStickerTilt(RESTING_OFFSET)).toBe(0);
  });
});
