import type CornerPosition from '../enums/CornerPosition';
import type { CollagePiecePlacement } from './CollagePiecePlacement';
import type { TapePiece } from './TapePiece';

export interface CoverPhotoPlacement extends CollagePiecePlacement {
  photoId: string;
  // Parallax drift factor (px risen per scrolled px); the CSS clamps the drift to ±24px.
  speed: number;
  tape?: TapePiece;
  corners: CornerPosition[];
}
