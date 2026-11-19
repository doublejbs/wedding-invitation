import AccountSide from '../enums/AccountSide';
import GalleryCategory from '../enums/GalleryCategory';
import MapProvider from '../enums/MapProvider';
import type { AccountGroup } from '../types/AccountGroup';
import type { BankAccount } from '../types/BankAccount';
import type { CompareRow } from '../types/CompareRow';
import type { GallerySet } from '../types/GallerySet';
import type { GreetingLine } from '../types/GreetingLine';
import type { HighlightCard } from '../types/HighlightCard';
import type { LabeledRow } from '../types/LabeledRow';
import type { MapLink } from '../types/MapLink';
import type { PhotoItem } from '../types/PhotoItem';
import { formatKoreanDateTime } from '../utils/WeddingDateUtils';

export const GROOM_NAME = '김신랑';

export const GROOM_FATHER = '김아버지';

export const GROOM_MOTHER = '박어머니';

export const BRIDE_NAME = '이신부';

export const BRIDE_FATHER = '이아버지';

export const BRIDE_MOTHER = '최어머니';

// TODO: Replace with 'images/couple.png' (transparent, background removed).
export const COUPLE_IMAGE_SRC = `${import.meta.env.BASE_URL}images/couple.svg`;

export const COUPLE_IMAGE_ALT = `${GROOM_NAME}과 ${BRIDE_NAME}의 사진`;

// Each paragraph is a list of lines; each line gets its own slight tilt for a handwritten feel.
export const GREETING_PARAGRAPHS: GreetingLine[][] = [
  [
    { text: '계절이 몇 번 바뀌는 동안', rotationDeg: -4 },
    { text: '같은 길을 나란히 걸어온 두 사람이', rotationDeg: -1 },
    { text: '이제 한 집의 이름으로', rotationDeg: -4 },
    { text: '새로운 계절을 맞이하려 합니다.', rotationDeg: 0 },
  ],
  [
    { text: '서툰 날에는 손을 잡아 주고', rotationDeg: -2 },
    { text: '좋은 날에는 함께 웃으며', rotationDeg: -3 },
    { text: '오래도록 다정하게 살겠습니다.', rotationDeg: -1 },
  ],
  [
    { text: '소중한 걸음으로 오셔서', rotationDeg: -3 },
    { text: '저희의 첫날을 축복해 주시면', rotationDeg: 0 },
    { text: '더없는 기쁨으로 간직하겠습니다.', rotationDeg: -2 },
  ],
];

export const CLOSING_LINE = '사랑을 담아♡';

export const SIGNATURE_LINE = `${GROOM_NAME}, ${BRIDE_NAME} 드림`;

export const CLOSING_LINE_ROTATION_DEG = -2;

export const SIGNATURE_LINE_ROTATION_DEG = -1;

/* ------------------------------------------------------------------ */
/* Launch design (launch.html)                                         */
/* ------------------------------------------------------------------ */

// Local time (KST for guests). Month is 0-based: 3 = April.
export const WEDDING_DATE_TIME = new Date(2027, 3, 17, 13, 0);

export const DATING_START_DATE = new Date(2022, 2, 1);

export const VENUE_NAME = '더채플웨딩홀';

export const VENUE_HALL = '3층 그랜드볼룸';

export const VENUE_ADDRESS = '서울특별시 ○○구 ○○로 123';

export const HERO_TITLE = 'The Wedding.';

export const HERO_SUBTITLE = '2027년 봄, 두 사람이 시작합니다.';

// One entry per line; words light up one by one while scrolling.
export const INTRODUCING_LINES: string[] = [`신랑 ${GROOM_NAME} 그리고 신부 ${BRIDE_NAME}.`, '이제, 하나의 이름으로.'];

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #3a3a3c 0%, #1c1c1e 100%)',
  'linear-gradient(160deg, #d9d4cc 0%, #8e8a84 100%)',
  'linear-gradient(135deg, #c7ccd6 0%, #5f6673 100%)',
  'linear-gradient(200deg, #e8e1d9 0%, #a39a8f 100%)',
];

// Builds a placeholder photo. To use a real image, set `src`, e.g. `${import.meta.env.BASE_URL}images/photo-1.jpg`.
const createPhoto = (photoNumber: number, alt: string, src = ''): PhotoItem => {
  return {
    id: `photo-${photoNumber}`,
    label: `사진 ${photoNumber}`,
    alt,
    src,
    gradient: PLACEHOLDER_GRADIENTS[photoNumber % PLACEHOLDER_GRADIENTS.length],
  };
};

export const HERO_PHOTO: PhotoItem = createPhoto(17, `${GROOM_NAME}과 ${BRIDE_NAME}의 대표 사진`);

export const HIGHLIGHT_CARDS: HighlightCard[] = [
  { id: 'first-meeting', title: '첫 만남', description: '2022년 봄, 같은 자리에서 처음 인사를 나눴습니다.', photo: createPhoto(13, '첫 만남 사진') },
  { id: 'seasons', title: '함께한 계절', description: '여러 번의 봄과 겨울을 나란히 지나왔습니다.', photo: createPhoto(14, '함께한 계절 사진') },
  { id: 'proposal', title: '프러포즈', description: '조용한 저녁, 앞으로를 함께하자고 약속했습니다.', photo: createPhoto(15, '프러포즈 사진') },
  { id: 'new-beginning', title: '새로운 시작', description: '이제 같은 이름으로 다음 계절을 맞이합니다.', photo: createPhoto(16, '새로운 시작 사진') },
];

export const GALLERY_SETS: GallerySet[] = [
  {
    category: GalleryCategory.STUDIO,
    label: '스튜디오',
    photos: [1, 2, 3, 4].map((photoNumber) => createPhoto(photoNumber, `스튜디오 사진 ${photoNumber}`)),
  },
  {
    category: GalleryCategory.SNAP,
    label: '스냅',
    photos: [5, 6, 7, 8].map((photoNumber) => createPhoto(photoNumber, `스냅 사진 ${photoNumber - 4}`)),
  },
  {
    category: GalleryCategory.DAILY,
    label: '일상',
    photos: [9, 10, 11, 12].map((photoNumber) => createPhoto(photoNumber, `일상 사진 ${photoNumber - 8}`)),
  },
];

export const CEREMONY_MEAL = '예식 후 같은 층 연회장에서 뷔페로 대접합니다.';

export const CEREMONY_PARKING = '건물 지하 주차장 2시간 무료 (안내 데스크에서 등록)';

export const COMPARE_ROWS: CompareRow[] = [
  { label: '태어난 곳', groom: '서울', bride: '부산' },
  { label: '좋아하는 계절', groom: '가을', bride: '봄' },
  { label: '좋아하는 것', groom: '오래된 영화와 산책', bride: '책과 따뜻한 차' },
  { label: '쉬는 날에는', groom: '동네 서점에 들릅니다', bride: '새로운 길을 걸어 봅니다' },
];

export const COMPARE_CLOSING_LABEL = '앞으로';

export const COMPARE_CLOSING_VALUE = '함께';

export const MAP_LINKS: MapLink[] = [
  { provider: MapProvider.NAVER, label: '네이버 지도', isAppLink: false },
  { provider: MapProvider.KAKAO, label: '카카오맵', isAppLink: false },
  { provider: MapProvider.TMAP, label: '티맵', isAppLink: true },
];

export const TRANSPORT_GUIDES: LabeledRow[] = [
  { label: '지하철', value: '○○선 ○○역 3번 출구에서 도보 5분' },
  { label: '버스', value: '○○역 정류장 하차 — 간선 000, 지선 0000' },
  { label: '주차', value: CEREMONY_PARKING },
];

// Example numbers only.
export const BANK_ACCOUNTS: BankAccount[] = [
  { id: 'groom', side: AccountSide.GROOM, relation: '신랑', holder: GROOM_NAME, bank: '○○은행', number: '000-0000-0000-00' },
  { id: 'groom-father', side: AccountSide.GROOM, relation: '신랑 아버지', holder: GROOM_FATHER, bank: '○○은행', number: '000-000000-00-000' },
  { id: 'groom-mother', side: AccountSide.GROOM, relation: '신랑 어머니', holder: GROOM_MOTHER, bank: '○○은행', number: '000-00-000000' },
  { id: 'bride', side: AccountSide.BRIDE, relation: '신부', holder: BRIDE_NAME, bank: '○○은행', number: '000-0000-0000-00' },
  { id: 'bride-father', side: AccountSide.BRIDE, relation: '신부 아버지', holder: BRIDE_FATHER, bank: '○○은행', number: '000-000000-00-000' },
  { id: 'bride-mother', side: AccountSide.BRIDE, relation: '신부 어머니', holder: BRIDE_MOTHER, bank: '○○은행', number: '000-00-000000' },
];

export const ACCOUNT_GROUPS: AccountGroup[] = [
  { side: AccountSide.GROOM, label: '신랑측', englishLabel: 'GROOM' },
  { side: AccountSide.BRIDE, label: '신부측', englishLabel: 'BRIDE' },
];

export const FOOTER_NOTE = '* 본 청첩장의 사진과 문구는 시안용 예시입니다.';

export const RSVP_MOCK_NOTICE = '시안에서는 저장되지 않습니다.';

export const CEREMONY_SPEC_ROWS: LabeledRow[] = [
  { label: '일시', value: formatKoreanDateTime(WEDDING_DATE_TIME) },
  { label: '장소', value: `${VENUE_NAME} ${VENUE_HALL}` },
  { label: '주소', value: VENUE_ADDRESS },
  { label: '식사', value: CEREMONY_MEAL },
  { label: '주차', value: CEREMONY_PARKING },
];
