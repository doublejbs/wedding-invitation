import CollageCaptionKind from '../enums/CollageCaptionKind';
import CornerPosition from '../enums/CornerPosition';
import HandwritingSlotId from '../enums/HandwritingSlotId';
import StickerKind from '../enums/StickerKind';
import TapeTone from '../enums/TapeTone';
import type { CollagePhotoPlacement } from '../types/CollagePhotoPlacement';
import type { CoverPhotoPlacement } from '../types/CoverPhotoPlacement';
import type { EditorialPhoto } from '../types/EditorialPhoto';
import type { ParentLine } from '../types/ParentLine';
import type { StickerPlacement } from '../types/StickerPlacement';
import type { StuckPiece } from '../types/StuckPiece';
import type { TapePiece } from '../types/TapePiece';
import { findEditorialPhoto } from '../utils/EditorialPhotoUtils';
import { formatLabelDateTime } from '../utils/WeddingDateUtils';
import {
  BRIDE_FATHER,
  BRIDE_MOTHER,
  BRIDE_NAME,
  GROOM_FATHER,
  GROOM_MOTHER,
  GROOM_NAME,
  WEDDING_DATE_TIME,
} from './InvitationData';

/* ------------------------------- Cover ------------------------------- */

export const TICKET_TITLE = 'ADMIT TWO';

export const DATE_STAMP_RING_TEXT = 'MINJUN · SEOYEON · WEDDING DAY · ';


export const COLLAGE_DATE_LABEL = formatLabelDateTime(WEDDING_DATE_TIME);

export const COVER_HINT = '스티커를 떼어 보세요';

// Cover photo canvas: 390 × 480 design px, scaled with the column width.
export const COVER_DESIGN_WIDTH = 390;

export const COVER_DESIGN_HEIGHT = 480;

// Four overlapping photos. Drift speeds stay small and the CSS clamps the drift to ±24px,
// so the overlaps hold while scrolling.
export const COVER_PHOTO_PLACEMENTS: CoverPhotoPlacement[] = [
  {
    photoId: 'photo-06',
    x: 22,
    y: 36,
    width: 148,
    rotationDeg: -6,
    delayMs: 0,
    speed: 0.05,
    tape: { tone: TapeTone.WHITE, centerRatio: 0.5, rotationDeg: -4 },
    corners: [],
  },
  {
    photoId: 'photo-02',
    x: 150,
    y: 64,
    width: 216,
    rotationDeg: 4,
    delayMs: 120,
    speed: 0.09,
    tape: { tone: TapeTone.KRAFT, centerRatio: 0.28, rotationDeg: 7 },
    corners: [],
  },
  {
    photoId: 'photo-12',
    x: 30,
    y: 236,
    width: 206,
    rotationDeg: -3,
    delayMs: 240,
    speed: 0.03,
    corners: [CornerPosition.TOP_LEFT, CornerPosition.BOTTOM_RIGHT],
  },
  {
    photoId: 'photo-15',
    x: 222,
    y: 196,
    width: 140,
    rotationDeg: 6,
    delayMs: 360,
    speed: 0.07,
    tape: { tone: TapeTone.WHITE, centerRatio: 0.62, rotationDeg: -8 },
    corners: [],
  },
];

export const COVER_STICKER_PLACEMENTS: StickerPlacement[] = [
  {
    id: 'cover-date-stamp',
    kind: StickerKind.DATE_STAMP,
    x: 272,
    y: 372,
    width: 96,
    rotationDeg: -12,
    delayMs: 520,
    isDraggable: true,
  },
  {
    id: 'cover-film',
    kind: StickerKind.FILM,
    x: 10,
    y: 378,
    width: 150,
    rotationDeg: -4,
    delayMs: 600,
    isDraggable: false,
    photoId: 'photo-04',
    frameNumber: '17A',
  },
];

// Label band below the names; it lands after the photos.
export const COVER_LABEL_PIECE: StuckPiece = { rotationDeg: -2, delayMs: 700 };

/* ------------------------------ Greeting ----------------------------- */

export const GREETING_PHOTO_ID = 'photo-11';

export const GREETING_PHOTO_TAPE: TapePiece = { tone: TapeTone.KRAFT, centerRatio: 0.5, rotationDeg: -5 };

export const GREETING_PHOTO_PIECE: StuckPiece = { rotationDeg: -5, delayMs: 0 };

export const GREETING_CARD_PIECE: StuckPiece = { rotationDeg: 1.5, delayMs: 160 };

export const GREETING_PARENT_LINES: ParentLine[] = [
  { parents: `${GROOM_FATHER} · ${GROOM_MOTHER}`, relation: '의 아들', name: GROOM_NAME },
  { parents: `${BRIDE_FATHER} · ${BRIDE_MOTHER}`, relation: '의 딸', name: BRIDE_NAME },
];

/* ---------------------------- Photo collage ---------------------------- */

// Photo collage canvas: 390 × 1350 design px, two loose columns that overlap a little.
// Each photo keeps clear paper below it for its caption (about 38px, which does not scale with the canvas),
// so no later photo or sticker covers a caption, also at 375px.
export const WALL_DESIGN_WIDTH = 390;

export const WALL_DESIGN_HEIGHT = 1350;

export const WALL_PHOTO_PLACEMENTS: CollagePhotoPlacement[] = [
  {
    photoId: 'photo-01',
    x: 16,
    y: 16,
    width: 220,
    rotationDeg: -3,
    delayMs: 0,
    frameNumber: '01A',
    caption: { kind: CollageCaptionKind.HANDWRITING, slotId: HandwritingSlotId.COLLAGE_CAPTION_1 },
    tape: { tone: TapeTone.WHITE, centerRatio: 0.5, rotationDeg: -3 },
    corners: [],
  },
  {
    photoId: 'photo-05',
    x: 214,
    y: 70,
    width: 152,
    rotationDeg: 4,
    delayMs: 140,
    frameNumber: '05A',
    caption: { kind: CollageCaptionKind.LABEL, text: 'TWO OF US' },
    corners: [CornerPosition.TOP_LEFT, CornerPosition.TOP_RIGHT],
  },
  {
    photoId: 'photo-07',
    x: 30,
    y: 248,
    width: 158,
    rotationDeg: 2,
    delayMs: 0,
    frameNumber: '07A',
    caption: { kind: CollageCaptionKind.HANDWRITING, slotId: HandwritingSlotId.COLLAGE_CAPTION_2 },
    tape: { tone: TapeTone.KRAFT, centerRatio: 0.7, rotationDeg: 8 },
    corners: [],
  },
  {
    photoId: 'photo-03',
    x: 176,
    y: 380,
    width: 196,
    rotationDeg: -4,
    delayMs: 140,
    frameNumber: '03A',
    caption: { kind: CollageCaptionKind.LABEL, text: 'JEJU · FIELD' },
    tape: { tone: TapeTone.WHITE, centerRatio: 0.3, rotationDeg: -6 },
    corners: [],
  },
  {
    photoId: 'photo-04',
    x: 14,
    y: 560,
    width: 200,
    rotationDeg: -2,
    delayMs: 0,
    frameNumber: '04A',
    caption: { kind: CollageCaptionKind.HANDWRITING, slotId: HandwritingSlotId.COLLAGE_CAPTION_3 },
    corners: [CornerPosition.BOTTOM_LEFT, CornerPosition.BOTTOM_RIGHT],
  },
  {
    photoId: 'photo-08',
    x: 214,
    y: 600,
    width: 150,
    rotationDeg: 3,
    delayMs: 140,
    frameNumber: '08A',
    caption: { kind: CollageCaptionKind.LABEL, text: 'LOOKING AWAY' },
    tape: { tone: TapeTone.KRAFT, centerRatio: 0.5, rotationDeg: -4 },
    corners: [],
  },
  {
    photoId: 'photo-09',
    x: 26,
    y: 800,
    width: 150,
    rotationDeg: -5,
    delayMs: 0,
    frameNumber: '09A',
    caption: { kind: CollageCaptionKind.HANDWRITING, slotId: HandwritingSlotId.COLLAGE_CAPTION_4 },
    tape: { tone: TapeTone.WHITE, centerRatio: 0.5, rotationDeg: 5 },
    corners: [],
  },
  {
    photoId: 'photo-10',
    x: 206,
    y: 908,
    width: 150,
    rotationDeg: 4,
    delayMs: 140,
    frameNumber: '10A',
    caption: { kind: CollageCaptionKind.LABEL, text: 'ON HIS OWN' },
    corners: [CornerPosition.TOP_LEFT, CornerPosition.BOTTOM_RIGHT],
  },
  {
    photoId: 'photo-14',
    x: 16,
    y: 1112,
    width: 200,
    rotationDeg: -2,
    delayMs: 0,
    frameNumber: '14A',
    caption: { kind: CollageCaptionKind.HANDWRITING, slotId: HandwritingSlotId.COLLAGE_CAPTION_5 },
    tape: { tone: TapeTone.KRAFT, centerRatio: 0.4, rotationDeg: -3 },
    corners: [],
  },
];

// Free stickers sit in the paper right of and below the last photo, clear of every caption.
export const WALL_STICKER_PLACEMENTS: StickerPlacement[] = [
  {
    id: 'wall-label',
    kind: StickerKind.LABEL,
    x: 214,
    y: 1212,
    width: 132,
    rotationDeg: -6,
    delayMs: 200,
    isDraggable: true,
    text: 'SPRING · 2027',
  },
  {
    id: 'wall-stamp',
    kind: StickerKind.STAMP,
    x: 306,
    y: 1244,
    width: 62,
    rotationDeg: 8,
    delayMs: 260,
    isDraggable: true,
    photoId: 'photo-06',
  },
  {
    id: 'wall-ticket',
    kind: StickerKind.TICKET,
    x: 156,
    y: 1306,
    width: 140,
    rotationDeg: -4,
    delayMs: 320,
    isDraggable: true,
    text: TICKET_TITLE,
  },
];

// Only the wall photos page through the lightbox, in wall order.
export const WALL_PHOTOS: EditorialPhoto[] = WALL_PHOTO_PLACEMENTS.flatMap((placement) => {
  const photo = findEditorialPhoto(placement.photoId);

  return photo ? [photo] : [];
});

/* ------------------------------ Ceremony ----------------------------- */

export const CEREMONY_STAMP_PHOTO_ID = 'photo-02';

export const CEREMONY_TICKET_PIECE: StuckPiece = { rotationDeg: -2, delayMs: 0 };

export const CEREMONY_STAMP_PIECE: StuckPiece = { rotationDeg: 7, delayMs: 200 };

/* ----------------------------- Directions ---------------------------- */

export const DIRECTIONS_PAPER_PIECE: StuckPiece = { rotationDeg: -1.5, delayMs: 0 };

/* ------------------------------- Closing ----------------------------- */

export const CLOSING_PHOTO_ID = 'photo-13';

export const CLOSING_PHOTO_PIECE: StuckPiece = { rotationDeg: 1, delayMs: 0 };

export const PAGE_LINK_COPY_KEY = 'collage-page-link';
