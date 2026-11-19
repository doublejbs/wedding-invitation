import type CollageCaptionKind from '../enums/CollageCaptionKind';
import type CornerPosition from '../enums/CornerPosition';
import type HandwritingSlotId from '../enums/HandwritingSlotId';
import type { CollagePiecePlacement } from './CollagePiecePlacement';
import type { TapePiece } from './TapePiece';

interface HandwritingCaption {
  kind: CollageCaptionKind.HANDWRITING;
  slotId: HandwritingSlotId;
}

interface LabelCaption {
  kind: CollageCaptionKind.LABEL;
  text: string;
}

export type CollagePhotoCaption = HandwritingCaption | LabelCaption;

export interface CollagePhotoPlacement extends CollagePiecePlacement {
  photoId: string;
  // Film frame number printed on the white border, e.g. "07A".
  frameNumber: string;
  caption: CollagePhotoCaption;
  tape?: TapePiece;
  corners: CornerPosition[];
}
