# 진용·하림 모바일 청첩장 — 인수인계

다른 기기나 계정에서 이어서 작업할 때 이 문서부터 읽는다.

## 기본 정보

- 신랑 서진용 (Seo Jinyong), 신부 장하림 (Jang Harim)
- 2027년 3월 6일 토요일 오후 5시, 식물관PH (유리 온실 예식장)
- 배포 주소: https://wedding-invitation-beta-sand.vercel.app (Vercel 프로젝트 `wedding-invitation`, 계정 doublejbs)
- 저장소: https://github.com/doublejbs/wedding-invitation (비공개)

## 지금 어디까지 왔나 (2026-11-20)

- 작업 브랜치: `feature/invitation-sections` (원격에 올라가 있음, `main`에는 아직 합치지 않음). 이어서 할 때는 이 브랜치를 받아서 시작한다.
- 배포된 사이트는 이 브랜치의 내용이다.
- 사용자가 정해 줘야 하는 것
  - 06번 사진(세로, 서로 기대어 웃는 사진)은 지금 어디에도 안 쓰인다. 사진 영역에 다시 넣을지.
  - 우표 종이 이미지(`textures/stamp-frame.png`)의 출처와 사용 조건.
  - 아래 "남은 일"의 자리 표시 정보(혼주 성함, 계좌, 교통, 주소 확인, 문구).
- 새 기기에서는 `npm ci` 후 `npx vitest run`으로 확인한다. git 작성자 설정은 아래 "빌드와 배포" 참고.

## 진행 방식

- 영역을 하나씩 정해서 같이 다듬고, 확정하면 다음 영역으로 넘어간다.
- 순서: 커버 → 인사말 → 사진 → 예식 안내 → 오시는 길 → 마음 전하실 곳 → 참석 여부 → 마무리
- 지금까지 확정: **커버**. 인사말·사진은 커버 톤에 다시 맞췄고, 예식 안내부터 마무리까지는 시안을 한 번에 만들었다. 모두 확정 전이다.
- 다음 차례는 **인사말**. 기획은 `docs/SectionsSpec.md`에 있고, 거기 적힌 순서대로 하나씩 확정한다.

## 디자인 톤 (모든 영역 공통)

- 흰 종이(#fbfbf8) 위에 그림자 없이 평평하게. 입체감은 크레파스 그림이 맡는다.
- 인사말 영역만 검은 면(`#000`, 사용자 요청). 화면 전체 폭 검은 띠, 글자는 종이색.
- 제목은 "단어 – 작은 크레파스 그림 – 단어" 구조, 화면 중심축에 맞춘다 (예: `CEREMONY 🌺 예식 안내`. 커버는 제목 `WEDDING INVITATION` 아래 이름 줄 `Seo Jinyong 💍 Jang Harim`이 이 구조).
- 좌우 정보는 가운데 기준으로 마주 보게 놓는다.
- 글꼴: 영문 Archivo 500, 한글 Noto Sans KR. 그림 색: 초록 잎, 붉은 꽃, 금색 반지.
- 한 영역에 그림은 하나만. 정보가 많은 영역은 글자 위주로.

### 하지 말 것 (사용자가 싫어한 것)

- AI·템플릿 느낌: `01 — GREETING` 같은 번호 라벨, 표, 테두리 버튼, 고르게 흩뿌린 사진(사진 영역은 크기가 다른 사진을 좁은 간격으로 맞물린 한 덩어리 — 사용자가 준 두 번째 참고 이미지 기준)
- 레퍼런스를 그대로 베낀 배치 (바른손 별 청첩장의 가운데 정렬 제목·Groom/Bride 두 칸 등)
- 인사말 제목, 인사말 서명 줄(진용 / 하림 드림)
- 각주, 영문 장소 표기(Sikmulgwan PH)
- 사진 영역의 글자(제목·문장·안내 문구). 사진 영역에는 사진만 둔다
- 슬라이드 필름 틀, 콜라주·스크랩북 시안
- 핑크·레이스·리본은 물어보고 넣는다 (레이스는 한 번 요청했었음)

## 영역별 상태

| 영역 | 파일 | 내용 |
|---|---|---|
| 커버 | `docs/cover-studies/GreenhouseCover.html` | 제목 `WEDDING INVITATION`, 이름 줄 `Seo Jinyong 💍 Jang Harim` (한글 이름은 영문 가운데 아래, 반지는 두 줄 높이 중앙에서 반짝임), 크레파스 유리 온실이 바닥부터 식물로 차오름(붉은 꽃 버진로드), 아래 `2027 / 03.06` ↔ `토요일 오후 5시 / 식물관PH`. 예식장 실시간 날씨 연출. 페이지 로드가 끝나면(늦어도 3초 뒤) 온실 인트로가 시작되고, 같은 순간 날씨가 서서히 나타난다(그 전에는 날씨를 그리지 않는다). 인트로는 페이지가 화면에 보일 때 첫 프레임부터 시작하고, 주소창 때문에 생기는 resize로는 끊기지 않는다. 상태는 `#greenhouse`의 `data-intro`(`waiting` → `playing` → `done`), `#weather`의 `data-weather`(`waiting` → `on`)로 확인한다. 웹 글꼴이 오기 전에는 크기를 맞춘 시스템 글꼴(`Archivo Fallback …`, `Noto Sans KR Fallback`)로 보여서 글꼴이 바뀔 때 줄이 거의 움직이지 않는다 |
| 인사말 | `docs/cover-studies/GreetingCard.html` | 시안, 확정 전. 제목 없음. 검은 면(`#000`, 화면 전체 폭, 내용은 440px 기둥). 사용자가 준 흰 종이 우표 이미지 한 장 안에 종이 청첩장 표지와 같은 사진 두 장(위 12번, 아래 04번, 컬러, 표지와 같은 구도)을 위아래로 넣음. 톱니 안쪽 네 변 고른 흰 여백, 두 사진 사이는 좁은 흰 띠. 06번 사진은 지금 어디에도 쓰이지 않음. 390px 화면에서 우표 약 125×180px. 아래 종이색 글자의 가운데 정렬 인사말. 서명 줄 없음(넣지 않기로 함) |
| 사진 | `docs/cover-studies/PhotosMosaic.html` | 14장을 하트 모양으로 배치(위 두 봉우리 사이 오목, 가운데 07번 베일 입맞춤이 가장 큼, 아래 08번 한 장이 끝). 시안, 확정 전. 흩어 놓은 배치와 비교한 끝에 사용자가 이 모아 붙인 배치를 골랐다(흩어 놓은 배치와 비교 페이지 `/mosaic.html`은 지움). 사용자가 준 두 번째 참고 이미지처럼 같은 14장을 좁은 간격(390px에서 약 5.5px)으로 맞물린 한 덩어리로 모음. 가운데 07번(베일 입맞춤)이 가장 크고 주변에 중간·작은 사진, 바깥 윤곽은 들쭉날쭉. 글자는 넣지 않는다(사용자 요청). 48열 CSS grid(행 높이 = 열 폭)에 사진마다 칸을 지정. 배치는 마크업+CSS(스크립트 없이도 그대로), 사진은 `loading="lazy"`. 누르면 종이색 화면에 원본 크게 보기(Esc·뒤로 가기로 닫힘). 예전 커버플로(`PhotosFlow.html`)는 지움 |
| 예식 안내 | `docs/cover-studies/CeremonyInfo.html` | 시안, 확정 전. `CEREMONY 🌺 예식 안내`, 혼주 줄 좌우, 날짜·시간과 D-day, 식사 안내 |
| 오시는 길 | `docs/cover-studies/Directions.html` | 시안, 확정 전. `LOCATION 🏡 오시는 길`, 누르면 복사되는 주소, 네이버 지도·카카오맵·티맵 글자 링크, 지하철·버스·주차 |
| 마음 전하실 곳 | `docs/cover-studies/GiftAccounts.html` | 시안, 확정 전. `GIFT ✉️ 마음 전하실 곳`, 신랑측·신부측 접기, 계좌번호 누르면 복사 |
| 참석 여부 | `docs/cover-studies/Rsvp.html` | 시안, 확정 전. `RSVP ✓ 참석 여부`, 측·참석·이름·인원·식사를 마주 보는 두 단어로 고르는 양식 |
| 마무리 | `docs/cover-studies/Closing.html` | 시안, 확정 전. `THANK 💍 YOU`, 마지막 인사, 청첩장 보내기·주소 복사 |

- 기획 문서 6장 "정해야 할 것"은 모두 추천안대로 구현해 두었다(혼주 줄 좌우, 지도 이미지 없음, 계좌 접기, 구글 시트 저장, 사진 크게 보기(위치 점은 커버플로와 함께 뺌). 인사말 서명 줄은 넣지 않기로 함). 사용자 확정 전이다.
- 마무리의 공유는 `청첩장 보내기`(휴대폰 기본 공유 창)다. 카카오톡 전용 공유는 카카오 앱 키가 있어야 해서 보류. PC처럼 공유 창이 없는 브라우저에서는 `주소 복사`만 가운데에 남는다.
- 공용 키트: `docs/cover-studies/SectionKit.css` / `SectionKit.js` — 커버 뒤 영역이 같이 쓰는 제목·크레파스 밑줄·동그라미·글자 크기와 누르면 복사 동작. 고치면 모든 영역에 반영된다.
- 기획 문서: `docs/SectionsSpec.md` — 영역별 기획, 그림 배정, 만드는 방식, 받아야 할 정보.
- 종이 청첩장 원본: `iCloud Drive/invitation_stamp.pdf` (첫 장 오른쪽이 표지).
- 인사말 우표 종이 이미지: `docs/cover-studies/textures/stamp-frame.png`(595×860, 바깥·구멍 투명). 원본은 `stamp-frame-source.png`(배포하지 않음), 다시 만들기는 `node scripts/BuildStampFrame.mjs docs/cover-studies/textures/stamp-frame-source.png`. **이 우표 이미지는 사용자가 준 것으로 출처·사용 조건은 확인되지 않음(공개 배포 전 확인 필요).**

다른 시안(`index.html` 봉투, `launch.html`, `editorial.html`, `collage.html`, `docs/cover-studies`의 `StarCover`·`FrameCover`·`CoverStudies`)은 참고용으로만 남겨 둔 것이다.

## 날씨 연동

- Open-Meteo(무료, 키 없음)로 현재 날씨를 30분마다 받아 커버에 연출한다: 맑음·흐림·비·눈·안개·뇌우·밤.
- 위치는 `VENUE_LATITUDE` / `VENUE_LONGITUDE` (지금은 서울 시청 좌표). 식물관PH 정확한 주소를 받으면 바꾼다.
- 모든 장면은 화면 주사율과 상관없이 시간 기준(초당 px)으로 움직인다. 밤에는 별이 천천히 흐르며 반짝이고, 몇 초에 한 번 별똥별이 짧게 지나간다.
- 주소창이 접히거나 펴져서 생기는 resize로는 입자를 다시 뿌리지 않는다. 캔버스 크기만 다시 잡고 기존 입자를 새 크기에 비례해 옮긴다.
- 미리보기: 주소 끝에 `#clear` `#cloudy` `#rain` `#snow` `#fog` `#storm` `#night`.
- claude.ai 아티팩트 링크에서는 외부 요청이 막혀 실시간 날씨가 안 된다. 배포한 사이트에서만 된다.

## 빌드와 배포

```bash
# 1. 영역별 파일을 최종본(Invitation.html)으로 합치기
cd docs/cover-studies && python3 ../../scripts/BuildInvitation.py && cd ../..

# 2. 배포용 site/ 만들기 (공유 미리보기 이미지를 절대 주소로)
python3 scripts/BuildSite.py https://wedding-invitation-beta-sand.vercel.app

# 3. 배포 — git 저장소 밖에서 해야 한다 (아래 주의 참고)
rm -rf /tmp/wedding-site && cp -R site /tmp/wedding-site
cd /tmp/wedding-site && vercel deploy --prod --yes --project wedding-invitation
```

- `BuildSite.py`는 시작할 때 `BuildInvitation.py`를 먼저 돌리므로 1번을 빼먹어도 낡은 `Invitation.html`이 배포되지 않는다.
- `RSVP_ENDPOINT`가 빈 채로 배포하면 하객이 보내기를 눌러도 저장되지 않고 "시안이라 아직 저장되지는 않아요."가 보인다. `BuildSite.py`가 끝에 경고 한 줄을 출력한다(실패는 아님).
- 합치는 순서는 `scripts/BuildInvitation.py`의 `SECTIONS` 목록 하나로 정한다. 영역을 늘릴 때 한 줄만 넣는다. 키트는 결과물에 한 번만 들어간다.
- 영역 파일에서 기대한 부분(스타일, 루트 요소, `aria-label` 등)을 못 찾으면 어느 파일의 무엇이 없는지 알려 주고 멈춘다.
- 화면 밖 사진은 늦게 불러온다: 인사말 우표 종이와 사진 영역의 사진은 모두 `loading="lazy"`.
- `BuildSite.py`는 페이지가 쓰는 사진과 `textures/` 파일만 복사한다(없으면 `site/`를 지우기 전에 알리고 멈춤). 사진 영역은 페이지에 적힌 작은 사진(`photo-NN-sm.jpg`)마다 크게 보기용 원본(`photo-NN.jpg`)을 함께 복사한다(14장 × 2). 인사말은 `photo-12.jpg`·`photo-04.jpg` 원본(사진 영역의 크게 보기용 원본과 같은 파일)과 `textures/stamp-frame.png`를 쓴다 (지금 사진 28장, 텍스처 1개).
- **주의**: 저장소 안에서 `vercel deploy`를 하면 커밋 작성자 정보가 붙는다. 작성자 이메일이 Vercel 계정 구성원이 아니면 배포가 `Blocked` 된다. 그래서 `site/`를 저장소 밖으로 복사해서 배포한다.
- 이 저장소의 git 작성자는 `서진용 <doublejbs@naver.com>` (저장소 로컬 설정). 새 기기에서는 다시 설정한다:

```bash
git config user.name "서진용"
git config user.email "doublejbs@naver.com"
```

### 파비콘·공유 미리보기 (온실 그림)

- 파비콘과 링크 공유 이미지는 모두 커버의 크레파스 유리 온실이다. 원본은 `docs/cover-studies/share/`에 있고, `BuildSite.py`가 이 폴더의 `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png`를 `site/` 루트로 복사하고 `<head>`에 파비콘·`og:*`·`twitter:*` 태그를 넣는다. 파일이 하나라도 없으면 어떤 파일인지 알리고 멈춘다.
- `favicon.svg`는 손으로 쓴 아이콘용 온실(16px에서도 읽히게 단순화, 안쪽을 종이색으로 채워 어두운 탭에서도 보임)이다. PNG 두 개는 이 SVG를 크롬으로 렌더링한 것이고, 홈 화면 아이콘은 iOS가 투명 배경을 검게 채우므로 종이색 바탕에 여백을 뒀다.
- `og-image.png`(1200×630)는 커버 캔버스를 그대로 렌더링해 종이색 위 가운데에 놓은 것이다. 글자는 넣지 않았다(카카오톡이 제목·설명을 이미지 아래에 따로 보여 준다). 온실은 가운데 정사각형 안에 있어서 2:1이나 정사각형으로 잘려도 전체가 보인다. 배치는 `share/ShareCard.html`.
- 다시 만들기: `node scripts/BuildShareImages.mjs` (크롬 필요, `CHROME_PATH`로 경로 변경 가능, 웹 글꼴 때문에 온라인에서). 몇 번을 돌려도 같은 그림이 나온다. 커버 그림이나 `favicon.svg`를 고쳤을 때만 돌리고, 결과 PNG는 커밋한다.
- **카카오톡은 링크 미리보기를 캐시한다.** 이미지를 바꿔 배포한 뒤에는 카카오 개발자 사이트의 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에 배포 주소를 넣고 캐시를 초기화해야 새 이미지가 보인다.

## 테스트

- `npx vitest run`. 영역 HTML은 `src/__tests__/InvitationSections.test.ts`가 본다: 영역 파일의 `<section>`을 붙이고 `SectionKit.js`와 인라인 스크립트를 실행해 D-day, 복사(실패 포함), 계좌 접기, 참석 여부 검사, 마무리를 확인한다.
- 이 테스트는 `BuildInvitation.py`를 실행해 `Invitation.html`을 다시 쓴다. 테스트 뒤 `Invitation.html`이 바뀌어 있는 것은 정상이다.
- 테스트가 `node:fs` 등을 쓰므로 `tsconfig.app.json`의 `types`에 `node`를 넣었다.

## 남은 일

- 인사말부터 마무리까지 하나씩 확정하기
- 자리 표시로 남은 정보 받아 넣기:
  - 혼주 성함 (예식 안내 `서○○ · ○○○`, 계좌 이름)
  - 식사 방식 (예식 안내 문장)
  - 식물관PH 주소 확인 — 지금 `서울 강남구 광평로34길 24`는 임시
  - 교통 정보 (지하철·버스·주차의 `○○`)
  - 계좌 6건 (신랑측·신부측 각 3건, 지금 `○○은행 000-0000-0000-00`)
  - 마무리 마지막 문장
- 인사말 문구 확정 (지금은 초안: "겨울 끝자락에 만난 두 사람이…")
- 손글씨: 커버 한글 이름을 직접 쓴 손글씨 이미지로 교체 (사진으로 받아 배경 제거). 인사말 서명 줄은 뺐으므로 제외
- 참석 여부 저장 연결: `scripts/RsvpSheet.gs`를 구글 시트에 웹 앱으로 배포하고(방법은 파일 머리 주석), 나온 URL을 `Rsvp.html`의 `RSVP_ENDPOINT`에 넣기. 비어 있는 동안은 보내기를 눌러도 전송하지 않는다
- 날씨 좌표(`VENUE_LATITUDE` / `VENUE_LONGITUDE`)를 식물관PH로 바꾸기
- 원하면 배포 주소를 원하는 이름이나 개인 도메인으로 바꾸기
