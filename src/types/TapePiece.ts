import type TapeTone from '../enums/TapeTone';

// A strip of masking tape across the top edge of a photo.
export interface TapePiece {
  tone: TapeTone;
  // Horizontal center of the tape as a share of the photo width (0–1).
  centerRatio: number;
  rotationDeg: number;
}
