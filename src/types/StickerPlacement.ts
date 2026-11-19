import type StickerKind from '../enums/StickerKind';
import type { CollagePiecePlacement } from './CollagePiecePlacement';

interface StickerPlacementBase extends CollagePiecePlacement {
  id: string;
  isDraggable: boolean;
}

interface DateStampPlacement extends StickerPlacementBase {
  kind: StickerKind.DATE_STAMP;
}

// LABEL and TICKET print readable text.
interface LabelPlacement extends StickerPlacementBase {
  kind: StickerKind.LABEL;
  text: string;
}

interface TicketPlacement extends StickerPlacementBase {
  kind: StickerKind.TICKET;
  text: string;
}

interface StampPlacement extends StickerPlacementBase {
  kind: StickerKind.STAMP;
  // Photo inside the perforated edge.
  photoId: string;
}

interface FilmPlacement extends StickerPlacementBase {
  kind: StickerKind.FILM;
  photoId: string;
  frameNumber: string;
}

// A free sticker on a design canvas; the fields it needs depend on its kind.
export type StickerPlacement = DateStampPlacement | LabelPlacement | TicketPlacement | StampPlacement | FilmPlacement;
