import type HandwritingSlotId from '../enums/HandwritingSlotId';

export interface PosterNotePlacement {
  slotId: HandwritingSlotId;
  // Photo the note annotates; the note drifts with that photo's parallax speed.
  photoId: string;
  // Position in poster design pixels.
  x: number;
  y: number;
  // Rotation of the small leading arrow that points from the note to its photo.
  arrowRotationDeg: number;
}
