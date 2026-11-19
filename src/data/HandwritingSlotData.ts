import HandwritingSlotId from '../enums/HandwritingSlotId';
import type { HandwritingSlot } from '../types/HandwritingSlot';
import { BRIDE_NAME, GROOM_NAME } from './InvitationData';

// Given names without the family name, e.g. "김신랑" → "신랑".
const GROOM_GIVEN_NAME = GROOM_NAME.slice(1);

const BRIDE_GIVEN_NAME = BRIDE_NAME.slice(1);

// Handwritten notes on the editorial and collage pages. Until real drawings exist, `text` is rendered with the
// placeholder font (Nanum Pen Script). To swap in a drawing, put an SVG/PNG under public/handwriting/
// and set `src`, e.g. `${import.meta.env.BASE_URL}handwriting/names.svg`.
// DATE_CIRCLE, UNDERLINE and their COLLAGE_ variants are decorative strokes: without `src` they are drawn as inline SVG paths.
export const HANDWRITING_SLOTS: Record<HandwritingSlotId, HandwritingSlot> = {
  [HandwritingSlotId.NAMES]: {
    id: HandwritingSlotId.NAMES,
    text: `${GROOM_GIVEN_NAME} & ${BRIDE_GIVEN_NAME}`,
    width: 220,
    rotationDeg: -6,
  },
  [HandwritingSlotId.DATE_CIRCLE]: {
    id: HandwritingSlotId.DATE_CIRCLE,
    text: '',
    width: 144,
    rotationDeg: -3,
  },
  [HandwritingSlotId.PHOTO_NOTE_1]: {
    id: HandwritingSlotId.PHOTO_NOTE_1,
    text: '제주, 여름',
    width: 110,
    rotationDeg: -5,
  },
  [HandwritingSlotId.PHOTO_NOTE_2]: {
    id: HandwritingSlotId.PHOTO_NOTE_2,
    text: '노을 질 무렵',
    width: 120,
    rotationDeg: 4,
  },
  [HandwritingSlotId.PHOTO_NOTE_3]: {
    id: HandwritingSlotId.PHOTO_NOTE_3,
    text: '우리 둘',
    width: 90,
    rotationDeg: -3,
  },
  [HandwritingSlotId.SECTION_NOTE]: {
    id: HandwritingSlotId.SECTION_NOTE,
    text: '와주세요!',
    width: 90,
    rotationDeg: -8,
  },
  [HandwritingSlotId.UNDERLINE]: {
    id: HandwritingSlotId.UNDERLINE,
    text: '',
    width: 200,
    rotationDeg: -1,
  },
  [HandwritingSlotId.SIGNATURE]: {
    id: HandwritingSlotId.SIGNATURE,
    text: `사랑을 담아, ${GROOM_GIVEN_NAME} ${BRIDE_GIVEN_NAME}`,
    width: 240,
    rotationDeg: -4,
  },
  [HandwritingSlotId.COLLAGE_HEADLINE]: {
    id: HandwritingSlotId.COLLAGE_HEADLINE,
    text: '우리, 결혼해요',
    width: 260,
    rotationDeg: -4,
  },
  [HandwritingSlotId.COLLAGE_DATE_CIRCLE]: {
    id: HandwritingSlotId.COLLAGE_DATE_CIRCLE,
    text: '',
    width: 190,
    rotationDeg: -2,
  },
  [HandwritingSlotId.COLLAGE_GREETING_NOTE]: {
    id: HandwritingSlotId.COLLAGE_GREETING_NOTE,
    text: '봄에 만나요',
    width: 120,
    rotationDeg: 6,
  },
  [HandwritingSlotId.COLLAGE_SIGNATURE]: {
    id: HandwritingSlotId.COLLAGE_SIGNATURE,
    text: `${GROOM_GIVEN_NAME} 그리고 ${BRIDE_GIVEN_NAME}`,
    width: 180,
    rotationDeg: -3,
  },
  [HandwritingSlotId.COLLAGE_CAPTION_1]: {
    id: HandwritingSlotId.COLLAGE_CAPTION_1,
    text: '처음 같은 들판',
    width: 130,
    rotationDeg: -3,
  },
  [HandwritingSlotId.COLLAGE_CAPTION_2]: {
    id: HandwritingSlotId.COLLAGE_CAPTION_2,
    text: '웃음이 많던 날',
    width: 120,
    rotationDeg: 2,
  },
  [HandwritingSlotId.COLLAGE_CAPTION_3]: {
    id: HandwritingSlotId.COLLAGE_CAPTION_3,
    text: '바람이 불던 오후',
    width: 130,
    rotationDeg: -2,
  },
  [HandwritingSlotId.COLLAGE_CAPTION_4]: {
    id: HandwritingSlotId.COLLAGE_CAPTION_4,
    text: '너를 보는 나',
    width: 110,
    rotationDeg: 3,
  },
  [HandwritingSlotId.COLLAGE_CAPTION_5]: {
    id: HandwritingSlotId.COLLAGE_CAPTION_5,
    text: '바다 앞에서',
    width: 110,
    rotationDeg: -4,
  },
  [HandwritingSlotId.COLLAGE_WAITING]: {
    id: HandwritingSlotId.COLLAGE_WAITING,
    text: '기다릴게요',
    width: 150,
    rotationDeg: -5,
  },
  [HandwritingSlotId.COLLAGE_UNDERLINE]: {
    id: HandwritingSlotId.COLLAGE_UNDERLINE,
    text: '',
    width: 150,
    rotationDeg: -1,
  },
  [HandwritingSlotId.COLLAGE_CLOSING]: {
    id: HandwritingSlotId.COLLAGE_CLOSING,
    text: '고마워요, 그리고 잘 살게요',
    width: 280,
    rotationDeg: -4,
  },
};
