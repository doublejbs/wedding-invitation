import type { StuckPiece } from './StuckPiece';

// Placement of anything stuck onto a design canvas (design px, scaled with the canvas width).
export interface CollagePiecePlacement extends StuckPiece {
  x: number;
  y: number;
  width: number;
}
