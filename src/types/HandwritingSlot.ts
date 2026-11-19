import type HandwritingSlotId from '../enums/HandwritingSlotId';

export interface HandwritingSlot {
  id: HandwritingSlotId;
  // Shown with the placeholder handwriting font while there is no image; also used as alt text.
  text: string;
  // Path to a hand-drawn SVG/PNG (e.g. under public/handwriting/). When set, it replaces the text.
  src?: string;
  // Rendered width in CSS pixels.
  width: number;
  rotationDeg: number;
}
