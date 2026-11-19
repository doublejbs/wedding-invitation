# 모바일 청첩장 — 스크랩북 시안 스펙

## 목표

다이어리 꾸미기 감성(종이·마스킹테이프·폴라로이드·빨간 하트 스티커·남색 볼펜 손글씨)의 네 번째 디자인.
사용자가 고른 레퍼런스를 모두 반영한다.

| 레퍼런스 | 적용 |
|---|---|
| 넛츠 "모바일 청첩장 2"(인스타그램) | 전체 감성·섹션 흐름(커버 → 인사말 → 타임라인 → 갤러리 → 달력 → 안내 → 방명록 → 엔딩) |
| Framer Champagne | 커버의 흩어진 사진 + 큰 이름(반전 블렌드) + 날짜 + 초대 문구 + 흐르는 INFO 띠, DM Mono 라벨, "n / 4" 전체 화면 아코디언 |
| cmiscm FFF / Text Gravity | 이름 글자를 끌면 스프링처럼 제자리로 돌아옴, 엔딩 화면 터치 시 하트가 퍼짐 |
| Codrops Blurry Text Reveal | 인사말이 한 줄씩 흐림→선명 |
| 선 그리기 | 날짜 동그라미, 밑줄, 타임라인 점선, 달력 17일 동그라미 |
| 손글씨 슬롯 | 에디토리얼 페이지의 손글씨 슬롯 시스템 재사용(나중에 사용자 손글씨 파일로 교체) |

업체 디자인·문구·이미지는 그대로 가져오지 않는다.

## 시각 기준

- 디자인 캔버스 원본 파일(시각적 기준, 반드시 열어볼 것):
  `/private/tmp/claude-501/-Users-user-Library-Application-Support-Claude-scratch-workspaces-bff30c92-8770-40fd-b724-c4380849648b-6a420885-9ced-47df-bd33-a03146a8562f-scratch-2026-11-18-2c6481/94be7ac9-a910-42cf-817f-8cfabb34abe3/scratchpad/design-canvas/project/*.dc.html`
  - Main(커버), Greeting(인사말), Story(우리 이야기), Gallery(갤러리), Calendar(달력·D-day), Info(안내 아코디언), Location(오시는 길 상세), Guestbook(방명록), Rsvp(참석 여부 시트), Ending(엔딩 크레딧)
  - 좌표·크기·색·폰트·문구는 이 파일들을 따른다. 사진 `/_blob/...` 경로는 아래 사진 매핑으로 바꾼다
- 기준 폭 390px(375px에서도 깨지지 않게, 가로 스크롤 금지)

## 구조

- 새 페이지 `scrapbook.html` → `src/ScrapbookMain.tsx` → `ScrapbookPageView`
- 컴포넌트 `src/components/scrapbook/`, 스타일 `src/styles/ScrapbookPage.css`(`.scrapbook` 루트 커스텀 프로퍼티)
- 기존 공용 코드 재사용: `InvitationData`, `WeddingDateUtils`, `MapLinkUtils`, `shared/CopyButtonView`, `useClipboardCopy`, `useSheetDismiss`, `useInkReveal`, `usePrefersReducedMotion`, `RsvpFormUtils`, 에디토리얼의 `HandwritingView`·`HandDrawnStrokeView`(필요하면 `shared/`로 옮겨 공용화)
- 봉투·런칭·에디토리얼 페이지와 테스트는 그대로 동작해야 함

## 디자인 토큰

- 종이 #f4f2ec, 노트 #fffefa, 글자 #2b2b2b, 보조 #6b6a66, 구분선 #cfcdc6
- 잉크 #24315e, 하트·강조 #c43a3a, 테이프 파랑 rgba(176,203,224,0.8) / 노랑 rgba(240,224,150,0.85)
- 포스트잇: 노랑 #f6e7a8, 하늘 #d6e6f2, 분홍 #f3d9d6, 연두 #dcebd5
- 글꼴: 손글씨(임시) Nanum Pen Script, 본문 Gowun Dodum, 제목 Gowun Batang, 라벨 DM Mono, 영문 이름 DM Sans(모두 Google Fonts)

## 사진 매핑 (`public/photos/photo-NN-sm.jpg`, 라이트박스는 `photo-NN.jpg`)

| 캔버스 blob id | 사진 |
|---|---|
| 9d4adaba… | 01 |
| d3cb1ee0… | 02 |
| 0503d587… | 04 |
| 977d1e6d… | 05 |
| 2593bd46… | 06 |
| 9b6b7b37… | 07 |
| e514f018… | 11 |
| 9e2fdd10… | 12 |
| 32b94ccf… | 13 |
| 51864d09… | 15 |

## 섹션 (위→아래)

1. **커버**: 캔버스 Main과 같음
   - 폴라로이드 4장이 천천히 떠다님
   - 큰 이름 `Minjun & / Seoyeon`(DM Sans 66px, `mix-blend-mode: difference`). **글자를 끌면 따라오고 놓으면 스프링으로 복귀**(pointer events, touch-action none, 놓을 때 `cubic-bezier(0.34,1.9,0.5,1)` 0.7s)
   - 손글씨 "우리, 결혼해요"는 와이프로 등장(슬롯)
   - 날짜 `27.04.17` + 손그림 동그라미 그리기
   - 초대 문구 + 밑줄 그리기
   - INFO 흐르는 띠, 하단 "이름을 끌어 보세요"
2. **인사말**: 줄 노트 카드, 인사말이 한 줄씩 blur(8px)→0 + 위로 6px(0.9s, 줄마다 0.22s 지연). 화면에 들어올 때 1회 재생
   - 테이프 사진, 서명 손글씨(슬롯), 양가 혼주
3. **우리 이야기**: 점선 경로가 스크롤 진행도에 맞춰 그려짐(마스크 방식, 진행도는 CSS 변수로 전달, setState 금지)
   - 폴라로이드 3장과 티켓 스티커가 경로가 지나갈 때 붙듯이 등장
   - 날짜·메모는 손글씨
   - 타임라인 데이터(날짜·문구·사진)는 데이터 파일로 분리
4. **갤러리**: 폴라로이드 한 장 + 손글씨 캡션 + 하트 스티커
   - 이전/다음 버튼, 점 표시, 스와이프, 필름 썸네일
   - 사진을 누르면 라이트박스(에디토리얼 `LightboxView` 재사용 또는 공용화)
5. **달력·D-day**: 2027년 4월 달력(계산으로 생성), 17일에 빨간 손그림 동그라미가 그려짐 + "우리 결혼식!" 손글씨
   - 일·시·분·초 카운트다운(1초마다 갱신, 실제 남은 시간 계산)
   - "내 캘린더에 저장하기"(.ics 파일 생성 다운로드)
6. **안내 아코디언**: 캔버스 Info와 같음
   - 01 예식 안내 / 02 오시는 길 / 03 마음 전하실 곳 / 04 참석 여부
   - 누르면 화면 가득 펼침(검정 바 "0n 제목 · n / 4 · 닫기 ×"), 한 번에 하나만 열림
   - 오시는 길 패널은 캔버스 Location 디자인(약도 자리·지도 버튼·포스트잇 교통 안내·주소 복사)
   - 마음 전하실 곳은 계좌 + 복사
   - 참석 여부는 캔버스 Rsvp 시트 디자인의 폼(신랑측/신부측, 성함*, 참석 여부*, 인원, 식사*) + 제출 시 "시안에서는 저장되지 않습니다."
7. **방명록**: 포스트잇 벽(예시 5개, 데이터 분리)
   - "축하 메시지 남기기" 시트(이름·메시지 입력, 제출하면 시안 안내 + 내 포스트잇이 벽에 추가되는 모습만 보여줌, 저장 안 함)
8. **엔딩 크레딧**: 노을 사진 위 크레딧 목록, 손글씨 "고마워요, 그리고 사랑해요"
   - **화면을 누르면 누른 위치에서 하트 8개가 퍼지며 사라짐**(1s, 최대 동시 30개)
   - 카카오톡 공유(시안: 안내만), 링크 복사

## 연출 규칙

- 라이브러리 없이 IntersectionObserver + rAF, 스크롤 값은 CSS 변수(per-frame setState 금지)
- `prefers-reduced-motion: reduce`이면 모든 연출 끄고 최종 상태(드래그·하트 퍼짐도 끔)
- 손글씨 텍스트는 등장 전에도 영구히 숨겨지지 않게(에디토리얼 `useInkReveal` 대체 타이머 규칙 유지)

## 접근성

- 이름 드래그 글자는 장식이므로 전체 이름을 `aria-label`로 제공, 글자 span은 aria-hidden
- 아코디언·시트·라이트박스는 에디토리얼·런칭과 같은 규칙(aria-expanded, dialog, inert, Escape, 포커스 복귀)
- 장식 SVG는 aria-hidden, 사진 alt는 장면 설명

## 수용 기준

1. `scrapbook.html`에 커버 → 인사말 → 우리 이야기 → 갤러리 → 달력 → 안내 → 방명록 → 엔딩 순서로 렌더링(각 section aria-label)
2. 이름 글자 드래그: pointerdown→move로 이동, pointerup 시 offset 0으로 복귀(단위 테스트)
3. 달력: 2027년 4월 1일이 목요일 칸, 17일 강조, 카운트다운 계산 함수 단위 테스트
4. 아코디언: 하나만 열림, "n / 4", 닫기
5. 방명록 시트 제출 시 시안 안내 + 새 포스트잇 표시
6. 엔딩 터치 시 하트 요소 생성 후 제거(가짜 타이머)
7. 기존 테스트 통과, `npm run lint`, `npx tsc -b`, `npm test`, `npm run build`(네 페이지) 통과
