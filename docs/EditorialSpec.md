# 모바일 청첩장 — 에디토리얼 + 손글씨 시안 스펙

## 목표

흑백 사진이 흩어진 한 장짜리 포스터 같은 첫 화면, 깔끔한 산세리프·고정폭 타이포, 전체 화면으로 펼쳐지는 아코디언 구성에 **손글씨 낙서**를 얹은 세 번째 디자인.
참고: Framer "Champagne" 템플릿의 구성·분위기만 참고하고, 코드·이미지·문구는 가져오지 않는다(유료 1회 라이선스 상품).

## 구조

- 기존 `index.html`(봉투), `launch.html`(런칭)은 그대로 둔다
- 새 페이지: `editorial.html` → `src/EditorialMain.tsx` → `EditorialPageView`
- 컴포넌트는 `src/components/editorial/`, 스타일은 `src/styles/EditorialPage.css`(`.editorial` 루트에 커스텀 프로퍼티)
- 이름·날짜·장소·계좌·지도 링크 등은 `src/data/InvitationData.ts`와 기존 유틸(`WeddingDateUtils`, `MapLinkUtils`)·훅(`useClipboardCopy`, `useSheetDismiss` 등)을 재사용

## 디자인 토큰

- 배경: 따뜻한 회색 종이색 #ecebe6, 글자 #141414, 보조 #5c5c58, 구분선 #cfcdc6
- 펼친 패널 상단 바: 검정 #141414 / 흰 글자
- 글꼴: 영문·숫자 DM Sans(Google Fonts), 라벨 DM Mono(Google Fonts, 대문자·자간 0.08em), 한글 Pretendard(이미 번들된 npm 패키지 재사용)
- **손글씨(임시)**: Nanum Pen Script(Google Fonts). 나중에 사용자가 만든 SVG/PNG로 교체
- 사진: 사용자 실제 웨딩 사진 15장(제주 들판·바다, 컬러). 원본은 `~/Downloads/보정본`, 웹용 사본은 `public/photos/`
  - `photo-NN.jpg`(긴 변 1600px, 라이트박스용), `photo-NN-sm.jpg`(긴 변 800px, 포스터 배치용), 메타데이터 제거됨
  - 가로: 01, 02, 03, 04, 12, 14 / 세로: 05, 06, 07, 08, 09, 10, 11, 13, 15
  - 장면: 01 넓은 들판 원경, 02 볼 키스, 03 마주 보며 웃음, 04 하늘 보며 걷기, 05 신랑 앞·신부 뒤, 06 기대어 웃음, 07 베일 키스, 08 신부 뒷모습, 09 신부 단독, 10 신랑 단독, 11 역광 키스, 12 역광 미소, 13 바닷가 노을, 14 바닷가 마주 걷기, 15 바닷가 백허그
- 포스터에서는 흑백(`filter: grayscale(1)`), 라이트박스에서는 **컬러 원본**으로 보여줌(흑백→컬러 0.6s 전환)
- 포스터에 7장 배치(예: 02, 06, 07, 11, 12, 13, 15), 라이트박스는 15장 전체를 순서대로 넘김

## 손글씨 슬롯 시스템 (핵심)

- `HandwritingSlot` 데이터: `{ id, text, src?, width, rotationDeg }`
  - `src`가 없으면 임시 폰트로 `text`를 렌더링
  - `src`가 있으면 `<img>`(SVG/PNG)로 렌더링 — 파일만 `public/handwriting/`에 넣고 경로만 바꾸면 교체됨
- 슬롯 id는 string enum `HandwritingSlotId`로 관리
- 등장 연출: 화면에 들어오면 왼쪽→오른쪽으로 **써지듯 드러남**(clip-path inset 와이프, 0.9s, ease-out). 1회만
- 손글씨 색: 잉크색 #1f2a44(짙은 남색) — 흑백 화면 위 유일한 색
- 슬롯 목록:
  1. `NAMES` — 큰 이름 타이포 위에 겹쳐 쓴 손글씨 이름 "○○ & ○○" (살짝 -6°)
  2. `DATE_CIRCLE` — 오른쪽 위 날짜를 두른 손그림 동그라미(SVG 경로, 그려지는 애니메이션 stroke-dashoffset)
  3. `PHOTO_NOTE_1` "제주, 여름", `PHOTO_NOTE_2` "노을 질 무렵", `PHOTO_NOTE_3` "우리 둘" — 사진 옆 메모 + 짧은 손그림 화살표
  4. `SECTION_NOTE` — 마지막 아코디언(참석 여부) 제목 옆 "와주세요!"
  5. `UNDERLINE` — 초대 문구 아래 손그림 밑줄(SVG, 그려지는 애니메이션)
  6. `SIGNATURE` — 맨 아래 "사랑을 담아, ○○ ○○"

## 화면 구성 (모바일 393px 기준)

1. **포스터 첫 화면** (높이 약 1.3 화면)
   - 흑백 사진 7장이 겹치지 않게 흩어져 배치(크기 제각각, 데이터로 좌표·크기 지정)
   - 스크롤 시 사진마다 다른 속도로 천천히 위로 흐름(패럴랙스, 속도 0.05~0.25). reduced-motion이면 정지
   - 사진을 탭하면 라이트박스(전체 화면, 좌우 스와이프, 닫기)
   - 큰 이름: DM Sans 64px 굵기 500, 두 줄 "신랑 / & / 신부"(영문 이름 예시 `Minjun & Seoyeon`), 사진 위에 `mix-blend-mode: difference`로 겹침
   - 그 위에 손글씨 `NAMES` 슬롯
   - 초대 문구(한글, Pretendard 17px): "두 사람이 함께하는 새로운 시작에 / 소중한 분들을 초대합니다." + `UNDERLINE`
   - 오른쪽 위 날짜 `27.04.17`(DM Sans) + `DATE_CIRCLE`
2. **흐르는 정보 띠**
   - 위아래 구분선 사이에서 가로로 무한히 흐름(CSS animation, 30s linear): "2027. 4. 17. SAT 1PM · 더채플웨딩홀 3층 그랜드볼룸 · 서울특별시 ○○구 ○○로 123 · "
   - 앞에 DM Mono 라벨 "INFO"
   - reduced-motion이면 정지하고 줄바꿈 표시
3. **아코디언 4개** (DM Mono 대문자 제목 + 오른쪽 + / −)
   - 열면 해당 패널이 화면을 채우고 상단에 검정 바 "닫기 ×"(sticky), 제목 옆 "1 / 4" 번호
   - 한 번에 하나만 열림
   - `01 예식 안내` — 큰 문장 "함께해 주시면 큰 기쁨이겠습니다." + 라벨/본문 목록: 일시, 장소, 식사, 주차, 화환(정중히 사양)
   - `02 오시는 길` — 지도 자리(플레이스홀더), 주소 + 복사, 네이버/카카오/티맵 버튼, 지하철·버스·주차
   - `03 마음 전하실 곳` — 신랑측/신부측 계좌 목록(은행·번호·예금주) + 복사 버튼
   - `04 참석 여부` — 폼(이름*, 연락처, 참석 여부*, 인원, 식사 여부*, 남기실 말씀) + 제출 시 "시안에서는 저장되지 않습니다." + "*4월 1일까지 알려주세요" + `SECTION_NOTE`
4. **마무리**
   - `SIGNATURE` 손글씨 + 작은 DM Mono 날짜·이름
   - 각주 "* 시안용 예시 사진과 문구입니다."

## 연출 규칙

- 라이브러리 없이 IntersectionObserver + rAF(스크롤 값은 CSS 변수로, setState 금지)
- 아코디언 패널 높이 전환은 `grid-template-rows: 0fr → 1fr` 0.5s
- `prefers-reduced-motion: reduce`이면 모든 연출 끄고 최종 상태(손글씨·선 모두 보임)
- 375px에서 가로 스크롤 없음(정보 띠는 overflow hidden)

## 접근성

- 아코디언: `button[aria-expanded]` + `region[aria-labelledby]`
- 라이트박스: `role="dialog"` `aria-modal`, Escape 닫기, 바깥 inert, 포커스 복귀
- 손글씨 이미지/텍스트: 의미 있는 슬롯(이름·서명·메모)은 대체 텍스트, 장식(동그라미·밑줄·화살표)은 `aria-hidden`

## 수용 기준

1. `editorial.html`에 포스터 → 정보 띠 → 아코디언 4개 → 마무리 순서로 렌더링
2. 손글씨 슬롯: `src` 없으면 텍스트, `src` 있으면 `<img>`로 렌더링(단위 테스트)
3. 아코디언: 하나를 열면 나머지가 닫히고 "n / 4"가 표시됨, 닫기 버튼 동작
4. 참석 여부 제출 시 시안 안내 표시
5. 사진 탭 → 라이트박스 열림, Escape로 닫힘
6. 기존 봉투·런칭 테스트 계속 통과, `npm run lint`, `npx tsc -b`, `npm test`, `npm run build` 통과
