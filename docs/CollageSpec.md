# 모바일 청첩장 — 콜라주 시안 스펙

## 목표

네 번째 디자인. **흑백 사진 + 손글씨 + 차분한 스티커 콜라주.**
웨딩피치(@wedding_peach_project)의 손글씨·흑백·스티커 구성에서 **핑크·레이스·리본·하트 같은 귀여운 장식은 모두 뺀** 버전이다.

| 레퍼런스 | 적용 |
|---|---|
| 웨딩피치 손글씨 모바일 청첩장 | 흑백 사진 위 손글씨, 스티커를 겹쳐 붙인 콜라주 구성 |
| Framer Champagne | 큰 이름 타이포, DM Mono 라벨, 넓은 여백 |
| cmiscm FFF | 스티커를 끌면 따라오고 놓으면 스프링으로 제자리 복귀 |
| 선 그리기 | 빨간 펜 동그라미(날짜), 밑줄 |
| 손글씨 슬롯 | 기존 `HandwritingSlot` 시스템 재사용(나중에 사용자 손글씨 파일로 교체) |

업체 디자인·문구·이미지는 그대로 가져오지 않는다.

## 금지

- 핑크·파스텔 색, 레이스, 리본, 하트 모양, 큐피드, 꽃 장식
- 사진 컬러 노출(라이트박스 포함 모두 흑백). 강조색은 **빨간 펜 #b3261e 하나만**, 페이지 전체에서 3곳 이하

## 구조

- 새 페이지 `collage.html` → `src/CollageMain.tsx` → `CollagePageView`
- 컴포넌트 `src/components/collage/`, 스타일 `src/styles/CollagePage.css`(`.collage` 루트에 커스텀 프로퍼티)
- `vite.config.ts` 빌드 입력에 `collage` 추가
- 재사용: `InvitationData`, `EditorialData`의 `EDITORIAL_PHOTOS`(사진 15장·alt), `WeddingDateUtils`, `MapLinkUtils`, `shared/HandwritingView`·`HandDrawnStrokeView`·`LightboxView`·`CopyButtonView`(모두 `classPrefix="collage"`), `useRevealOnView`, `useInkReveal`, `useParallaxDrift`, `useLightboxState`, `useAttendanceState`, `useClipboardCopy`, `usePrefersReducedMotion`, `RsvpFormUtils`
- 공용 훅·컴포넌트가 에디토리얼 전용 문구나 클래스를 하드코딩하고 있으면 prop으로 빼서 공용화한다(에디토리얼 동작은 그대로)
- 봉투·런칭·에디토리얼 페이지와 기존 테스트는 그대로 동작해야 함

## 디자인 토큰

- 종이 #efede7, 카드 종이 #f8f7f3, 글자 #151515, 보조 #6a6964, 구분선 #d3d0c8
- 손글씨 잉크(임시) #1d1d1b, 빨간 펜 #b3261e
- 테이프: 반투명 흰색 rgba(255,255,255,0.55)+미세 테두리 / 크라프트 rgba(196,170,128,0.75)
- 라벨기 띠: 검정 #111 바탕에 흰 DM Mono 대문자, 살짝 볼록한 inset 그림자
- 사진: `filter: grayscale(1) contrast(1.08)`, 흰 테두리 6~8px 또는 테두리 없이 찢은 종이 위
- 글꼴: 손글씨(임시) Nanum Pen Script, 본문 Pretendard(번들), 제목 영문 DM Sans, 라벨 DM Mono(모두 이미 사용 중)
- 기준 폭 390px, 375px에서 가로 스크롤 없음. 데스크톱은 가운데 최대 480px 열

## 스티커 종류(`StickerKind` enum)

`TAPE`(마스킹테이프), `LABEL`(라벨기 글자 띠), `TICKET`(티켓 반쪽, 톱니 가장자리), `STAMP`(우표, 톱니 테두리 안 흑백 사진), `DATE_STAMP`(원형 날짜 도장, 잉크가 고르지 않은 느낌), `FILM`(필름 조각, 구멍 + 프레임 번호), `PAPER`(찢은 종이 조각, clip-path 불규칙 가장자리), `CORNER`(사진 모서리 고정 삼각형).
모두 CSS·인라인 SVG로 그린다(이미지 파일 추가 금지). 장식 스티커는 `aria-hidden`, 글자가 의미 있는 라벨·티켓은 읽히게 한다.

## 섹션 (위→아래, 각 `section`에 `aria-label`)

1. **커버**
   - 흑백 사진 4장이 서로 겹쳐 비스듬히 붙어 있음(테이프·모서리 스티커로 고정)
   - 큰 손글씨 "우리, 결혼해요"(슬롯, 와이프 등장)
   - 영문 이름 `Minjun & Seoyeon`(DM Sans), 라벨기 띠 `2027.04.17 SAT 1PM`, 날짜 위 빨간 펜 동그라미 그리기
   - 날짜 도장, 필름 조각 1개
   - 하단 DM Mono 안내 "스티커를 떼어 보세요"
2. **인사말**: 찢은 종이 카드 위 인사말(본문 글꼴) + 서명 손글씨(슬롯) + 양가 혼주. 테이프로 붙인 사진 1장, 손글씨 메모 1개
3. **사진 콜라주**: 사진 9장을 2열 비정형 콜라주로 겹쳐 배치(배치값은 데이터 파일). 사진마다 손글씨 캡션 또는 라벨 띠 중 하나, 필름 프레임 번호. 사진을 누르면 라이트박스(흑백 유지, `collage-` 클래스)
4. **예식 안내**: 티켓 스티커(`ADMIT TWO`, 일시·장소·홀), 우표 스티커, 손글씨 "기다릴게요"(슬롯), 식사·주차·화환 안내
5. **오시는 길**: 주소 + 복사, 지도 버튼 3개(네이버·카카오·티맵, 기존 `MAP_LINKS`/`MapLinkUtils`), 교통 안내는 메모지(`PAPER`) 위에
6. **마음 전하실 곳**: 신랑측·신부측 라벨 띠 아래 계좌 목록 + 복사(기존 `BANK_ACCOUNTS`). 측별 펼침/접기(`aria-expanded`)
7. **참석 여부**: 기존 `useAttendanceState` 폼(성함*, 참석/불참*, 인원, 식사*) + 제출 시 `RSVP_MOCK_NOTICE`. 마감 안내 문구
8. **마무리**: 큰 흑백 사진 위 손글씨 "고마워요, 그리고 잘 살게요"(슬롯), 링크 복사 버튼, 시안 안내 `FOOTER_NOTE`

## 연출 규칙

- 라이브러리 없이 IntersectionObserver + rAF, 스크롤 값은 CSS 변수(per-frame setState 금지)
- **붙는 등장**: 사진·스티커가 화면에 들어오면 `scale(1.06)`·각도 +3° → 최종 각도로 0.5s 내려앉음(요소별 지연 데이터화), 1회
- 손글씨: 기존 `HandwritingView` 와이프(대체 타이머 규칙 유지, 영구히 숨겨지지 않게)
- 커버 사진은 `useParallaxDrift`로 속도 차이 살짝(겹침이 깨지지 않을 정도, 최대 ±24px)
- **스티커 떼기(FFF)**: 커버·콜라주의 `LABEL`·`STAMP`·`TICKET`·`DATE_STAMP` 스티커를 pointer로 끌면 따라오고(살짝 들림: 그림자 커짐, 회전 offset.x/8), 놓으면 `cubic-bezier(0.34,1.7,0.5,1)` 0.6s로 제자리 복귀. `touch-action: none`은 스티커에만(페이지 스크롤 방해 금지). 드래그 위치는 rAF로 style 직접 쓰기 또는 state 1개 — 매 pointermove마다 전체 섹션 리렌더 금지
- `prefers-reduced-motion: reduce`이면 모든 연출 끄고 최종 상태(드래그도 끔)

## 접근성

- 장식 스티커·SVG는 `aria-hidden`, 사진 alt는 장면 설명(`EDITORIAL_PHOTOS` alt 사용)
- 사진 버튼은 `button`(alt 포함 라벨), 라이트박스는 기존 규칙(dialog, inert, Escape, 포커스 복귀)
- 끌 수 있는 스티커는 키보드 대상이 아님(장식). 의미 있는 정보(날짜·장소)는 스티커 밖 본문에도 텍스트로 있어야 함
- 대비: 본문 글자 대비 4.5:1 이상

## 수용 기준

1. `collage.html`이 커버 → 인사말 → 사진 콜라주 → 예식 안내 → 오시는 길 → 마음 전하실 곳 → 참석 여부 → 마무리 순서로 렌더링(각 section aria-label)
2. 스티커 드래그: pointerdown→move로 offset 이동, pointerup/cancel 시 offset 0 복귀(유틸·훅 단위 테스트), reduced-motion이면 드래그 안 됨
3. 사진 콜라주 사진 클릭 → 라이트박스 열림, Escape로 닫힘
4. 계좌 측별 펼침/접기, 복사 버튼 동작(클립보드 mock)
5. 참석 여부 제출 시 시안 안내 표시
6. 페이지 안에 핑크·하트 관련 클래스/색 없음(테스트로 HTML에 `heart` 문자열 없음 확인)
7. 기존 테스트 통과, `npm run lint`, `npx tsc -b`, `npm test`, `npm run build`(네 페이지) 통과
