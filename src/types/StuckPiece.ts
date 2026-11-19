// Resting angle and landing delay of a piece that "sticks on" when it enters the viewport.
export interface StuckPiece {
  // Final resting angle; the piece lands from this angle + 3deg.
  rotationDeg: number;
  delayMs: number;
}
