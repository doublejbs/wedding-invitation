import EditorialPanelId from '../enums/EditorialPanelId';
import HandwritingSlotId from '../enums/HandwritingSlotId';
import PhotoOrientation from '../enums/PhotoOrientation';
import type { AccordionPanel } from '../types/AccordionPanel';
import type { EditorialPhoto } from '../types/EditorialPhoto';
import type { LabeledRow } from '../types/LabeledRow';
import type { PhotoScene } from '../types/PhotoScene';
import type { PosterNotePlacement } from '../types/PosterNotePlacement';
import type { PosterPhotoPlacement } from '../types/PosterPhotoPlacement';
import { formatDotDate, formatEnglishDateTime, formatKoreanDateTime } from '../utils/WeddingDateUtils';
import {
  BRIDE_NAME,
  CEREMONY_MEAL,
  CEREMONY_PARKING,
  GROOM_NAME,
  VENUE_ADDRESS,
  VENUE_HALL,
  VENUE_NAME,
  WEDDING_DATE_TIME,
} from './InvitationData';

export const GROOM_ENGLISH_NAME = 'Minjun';

export const BRIDE_ENGLISH_NAME = 'Seoyeon';

export const INVITATION_LINES = ['두 사람이 함께하는 새로운 시작에', '소중한 분들을 초대합니다.'];

const PHOTO_SCENES: PhotoScene[] = [
  { orientation: PhotoOrientation.LANDSCAPE, alt: '넓은 제주 들판 한가운데 선 두 사람의 원경' },
  { orientation: PhotoOrientation.LANDSCAPE, alt: '신랑이 신부의 볼에 입맞추는 모습' },
  { orientation: PhotoOrientation.LANDSCAPE, alt: '서로 마주 보며 웃는 두 사람' },
  { orientation: PhotoOrientation.LANDSCAPE, alt: '하늘을 올려다보며 함께 걷는 두 사람' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '앞에 선 신랑과 그 뒤에 선 신부' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '서로에게 기대어 웃는 두 사람' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '베일 아래에서 입맞추는 두 사람' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '들판을 바라보는 신부의 뒷모습' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '들판에 홀로 선 신부' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '들판에 홀로 선 신랑' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '역광 속에서 입맞추는 두 사람' },
  { orientation: PhotoOrientation.LANDSCAPE, alt: '역광 속에서 미소 짓는 두 사람' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '노을 지는 바닷가에 선 두 사람' },
  { orientation: PhotoOrientation.LANDSCAPE, alt: '바닷가에서 마주 보며 걷는 두 사람' },
  { orientation: PhotoOrientation.PORTRAIT, alt: '바닷가에서 신부를 뒤에서 안은 신랑' },
];

const createEditorialPhoto = (scene: PhotoScene, index: number): EditorialPhoto => {
  const fileNumber = String(index + 1).padStart(2, '0');

  return {
    id: `photo-${fileNumber}`,
    orientation: scene.orientation,
    alt: scene.alt,
    src: `${import.meta.env.BASE_URL}photos/photo-${fileNumber}.jpg`,
    smallSrc: `${import.meta.env.BASE_URL}photos/photo-${fileNumber}-sm.jpg`,
  };
};

// All 15 photos in file order; the lightbox pages through them in this order.
export const EDITORIAL_PHOTOS: EditorialPhoto[] = PHOTO_SCENES.map(createEditorialPhoto);

// Poster layout is authored on a 393 × 1100 design canvas and scaled with the poster width.
export const POSTER_DESIGN_WIDTH = 393;

export const POSTER_DESIGN_HEIGHT = 1100;

// Photos above this design y are visible on first paint and load eagerly.
export const POSTER_ABOVE_FOLD_Y = 520;

// Seven black-and-white photos scattered without overlapping (landscape 3:2, portrait 2:3).
// Parallax speeds fall steadily from top to bottom, so anything higher on the poster always rises faster
// than anything below it: gaps only grow while scrolling and nothing drifts into another photo or note.
export const POSTER_PHOTO_PLACEMENTS: PosterPhotoPlacement[] = [
  { photoId: 'photo-02', x: 20, y: 92, width: 176, speed: 0.22 },
  { photoId: 'photo-06', x: 248, y: 122, width: 118, speed: 0.2 },
  { photoId: 'photo-07', x: 40, y: 286, width: 136, speed: 0.18 },
  { photoId: 'photo-11', x: 254, y: 392, width: 108, speed: 0.15 },
  { photoId: 'photo-12', x: 118, y: 612, width: 196, speed: 0.12 },
  { photoId: 'photo-13', x: 24, y: 770, width: 100, speed: 0.09 },
  { photoId: 'photo-15', x: 236, y: 798, width: 124, speed: 0.06 },
];

// The date sits above every photo, so it drifts at least as fast as the fastest one.
export const POSTER_DATE_SPEED = 0.22;

// Notes sit in empty paper just below their photo (design px) and drift with that photo's speed.
// The arrow leads the text; it points right by default and is rotated toward the photo (-90 = straight up).
export const POSTER_NOTE_PLACEMENTS: PosterNotePlacement[] = [
  { slotId: HandwritingSlotId.PHOTO_NOTE_1, photoId: 'photo-02', x: 56, y: 234, arrowRotationDeg: -70 },
  { slotId: HandwritingSlotId.PHOTO_NOTE_3, photoId: 'photo-11', x: 246, y: 568, arrowRotationDeg: -45 },
  { slotId: HandwritingSlotId.PHOTO_NOTE_2, photoId: 'photo-13', x: 40, y: 934, arrowRotationDeg: -75 },
];

const TICKER_SEPARATOR = ' · ';

export const TICKER_TEXT = [formatEnglishDateTime(WEDDING_DATE_TIME), `${VENUE_NAME} ${VENUE_HALL}`, VENUE_ADDRESS]
  .map((item) => `${item}${TICKER_SEPARATOR}`)
  .join('');

export const ACCORDION_PANELS: AccordionPanel[] = [
  { id: EditorialPanelId.CEREMONY, number: '01', title: '예식 안내', englishTitle: 'Ceremony' },
  { id: EditorialPanelId.DIRECTIONS, number: '02', title: '오시는 길', englishTitle: 'Directions' },
  { id: EditorialPanelId.GIFT, number: '03', title: '마음 전하실 곳', englishTitle: 'Gift' },
  { id: EditorialPanelId.ATTENDANCE, number: '04', title: '참석 여부', englishTitle: 'RSVP' },
];

export const CEREMONY_HEADLINE = '함께해 주시면 큰 기쁨이겠습니다.';

export const CEREMONY_FLOWER_NOTE = '화환은 정중히 사양합니다. 축하의 마음만 감사히 받겠습니다.';

export const EDITORIAL_CEREMONY_ROWS: LabeledRow[] = [
  { label: '일시', value: formatKoreanDateTime(WEDDING_DATE_TIME) },
  { label: '장소', value: `${VENUE_NAME} ${VENUE_HALL}` },
  { label: '식사', value: CEREMONY_MEAL },
  { label: '주차', value: CEREMONY_PARKING },
  { label: '화환', value: CEREMONY_FLOWER_NOTE },
];

export const ATTENDANCE_DEADLINE_NOTE = '*4월 1일까지 알려주세요';

export const CLOSING_CAPTION = `${formatDotDate(WEDDING_DATE_TIME)} — ${GROOM_NAME} & ${BRIDE_NAME}`;

export const EDITORIAL_FOOTNOTE = '* 시안용 예시 사진과 문구입니다.';
