# 진용·하림 모바일 청첩장 — 인수인계

다른 기기나 계정에서 이어서 작업할 때 이 문서부터 읽는다.

## 기본 정보

- 신랑 서진용 (Seo Jinyong), 신부 장하림 (Jang Harim)
- 2027년 3월 6일 토요일 오후 5시, 식물관PH (유리 온실 예식장)
- 배포 주소: https://jinyongharim.com (Vercel 프로젝트 `wedding-invitation`, 계정 doublejbs. `www.jinyongharim.com`과 예전 주소 https://wedding-invitation-beta-sand.vercel.app 도 같은 사이트로 열린다)
- 도메인: 가비아에서 산 `jinyongharim.com`. DNS는 가비아 DNS 관리에 A `@` → `216.198.79.1`, CNAME `www` → `888054b785943ab3.vercel-dns-017.com.` 두 개를 넣었다(2026-11-26)
- 저장소: https://github.com/doublejbs/wedding-invitation (**공개** — 커밋한 내용은 누구나 볼 수 있다. 계좌번호·연락처 같은 개인정보는 커밋 전에 사용자에게 확인한다)

## 지금 어디까지 왔나 (2026-11-22)

- 기준 브랜치: `main`. 새 작업은 최신 `origin/main`에서 브랜치를 따서 시작한다. 예전 `feature/*` 브랜치는 모두 `main`에 합쳐졌으니 이어 쓰지 않는다.
- 배포된 사이트는 2026-11-26에 `main`과 같은 내용으로 만든 빌드다(네이버 지도, `jinyongharim.com` 주소 기준 공유 미리보기까지). `RSVP_ENDPOINT`는 빈 채로 배포했다.
- 사용자가 정해 줘야 하는 것
  - 우표 종이 이미지(`textures/stamp-frame.png`)의 출처와 사용 조건.
  - 혼주 실명을 공개해도 되는지. 공개 저장소의 `main` 이력에 이미 들어가 있어, 빼려면 파일 수정뿐 아니라 이력 정리도 필요하다.
  - 아래 "남은 일"의 자리 표시 정보(계좌와 예금주, 교통, 주소 확인, 문구).
- 새 기기에서는 `npm ci` 후 `npm test`, `npm run lint`, `npm run build`로 확인한다(테스트에 `python3` 필요). git 작성자 설정은 아래 "빌드와 배포" 참고.

## 진행 방식

- 영역을 하나씩 정해서 같이 다듬고, 확정하면 다음 영역으로 넘어간다.
- 순서: 커버 → 인사말 → 두 사람 → 사진 → 예식 안내 → 오시는 길 → 마음 전하실 곳 → 참석 여부 → 마무리
- 지금까지 확정: **커버**, **인사말 톤**(뒤 영역의 기준), **예식 안내 배치**. 인사말 문구와 나머지 영역은 확정 전이다.
- 다음 차례는 **인사말**. 기획은 `docs/SectionsSpec.md`에 있고, 거기 적힌 순서대로 하나씩 확정한다.

## 디자인 톤 (모든 영역 공통)

- 흰 종이(#fbfbf8) 위에 그림자 없이 평평하게. 입체감은 크레파스 그림이 맡는다.
- 배경 전체에 우표 종이와 같은 종이 질감(`textures/paper.png`, 우표 원본 `stamp-frame-source.png` 가운데를 잘라 이음매 없이 만든 400px 타일, 200px로 깔음). `SectionKit.css`와 커버의 `body` 배경, 사진 크게 보기 배경에 쓴다. 검은 면 말고는 영역마다 따로 배경을 칠하지 않아야 질감이 이어진다.
- 검은 면은 인사말·마무리(처음·끝 짝). 예식 안내는 사용자 요청으로 흰 종이. 검은 면은 `#000` 위에 검은 종이 질감(`textures/paper-black.png`), 화면 전체 폭 띠, 글자는 종이색.
- **오시는 길·마음 전하실 곳·참석 여부·마무리는 예식 안내의 배치와 글자 크기를 따른다**(사용자 요청, `docs/SectionsSpec.md` 1-1). 예식 안내는 사용자 참고 페이지(몽글미 `meadow` 일시 영역) 배치로 제목·그림 없이 일시·장소·달력·남은 시간. 뒤 세 영역은 한글 이름이 제목(`오시는 길`·`마음 전하실 곳`·`참석 여부`, Archivo/Noto Sans KR 500, `clamp(28px, 8.5vw, 33px)`, 자간 -0.035em, 아래 여백 36px). 영문 제목은 쓰지 않는다(사용자 요청). 모든 줄 가운데, 본문 15px(줄 높이 1.95), 작은 라벨 12px 보조색, 큰 글자 `clamp(22px, 6.6vw, 26px)`, 위아래 여백 88px. 마무리는 우표와 글·제목 없음. 톤은 커버와 같은 잉크·종이·크레파스 색. 올리브 단색·손글씨 글꼴은 쓰지 않는다(사용자 요청). 규칙은 `SectionKit.css`의 `.section--detail` 블록에 있다(인사말·사진은 이 클래스를 쓰지 않음). 예전의 제목 위 크레파스 그림(`svg.crayon-art`)은 뺐다.
- 커버는 제목 `WEDDING INVITATION` 아래 이름 줄 `Seo Jinyong 💍 Jang Harim`이 "단어 – 그림 – 단어" 구조로 남아 있다.
- 양 끝에 마주 보게 놓는 배치(`.pair`)는 커버에만 남았다. 뒤 영역의 짝(신랑측·신부측, 선택지)은 가운데에 나란히(간격 28px) 둔다.
- 동작은 키트의 알약 버튼: `.pill`(잉크색 면, 캘린더에 추가·보내기·청첩장 보내기)과 `.pill--line`(1px 테두리, 지도 앱·주소 복사). 검은 면에서는 색이 뒤집힌다. 크레파스 밑줄은 눌러서 복사되는 글자(주소, 계좌번호)에만, 고른 항목은 크레파스 동그라미.
- 글꼴: 영문 Archivo 500, 한글 Noto Sans KR. 그림 색: 초록 잎, 붉은 꽃, 금색 반지.
- 크레파스 그림은 커버에만. 뒤 영역은 글자 위주로.

### 하지 말 것 (사용자가 싫어한 것)

- AI·템플릿 느낌: `01 — GREETING` 같은 번호 라벨, 표, 테두리 버튼(지도 앱·주소 복사의 `.pill--line`은 사용자가 정한 예외), 고르게 흩뿌린 사진(지금 사진 영역은 크기와 간격을 일부러 고르지 않게 한 스크랩북 배치)
- 레퍼런스를 그대로 베낀 배치 (바른손 별 청첩장의 제목 모양·Groom/Bride 두 칸 등. 오시는 길~참석 여부의 가운데 제목은 나중에 사용자가 준 참고 이미지를 따른 것)
- 인사말 제목, 인사말 서명 줄(진용 / 하림 드림)
- 각주, 영문 장소 표기(Sikmulgwan PH)
- 사진 영역의 글자(제목·문장·안내 문구). 사진 영역에는 사진만 둔다
- 슬라이드 필름 틀, 청첩장 전체를 콜라주·스크랩북으로 꾸민 예전 시안(`CollageSpec.md`, `ScrapbookSpec.md`: 스티커·테이프·손글씨). 사진 영역의 스크랩북 배치는 나중에 사용자가 준 참고 이미지를 따른 것이라 해당하지 않는다
- 핑크·레이스·리본은 물어보고 넣는다 (레이스는 한 번 요청했었음)

## 영역별 상태

| 영역 | 파일 | 내용 |
|---|---|---|
| 커버 | `docs/cover-studies/GreenhouseCover.html` | 제목 `WEDDING INVITATION`, 이름 줄 `Seo Jinyong 💍 Jang Harim` (한글 이름은 영문 가운데 아래, 반지는 두 줄 높이 중앙에서 반짝임), 크레파스 유리 온실이 바닥부터 식물로 차오름(붉은 꽃 버진로드), 아래 `2027 / 03.06` ↔ `토요일 오후 5시 / 식물관PH`. 예식장 실시간 날씨 연출. 페이지 로드가 끝나면(늦어도 3초 뒤) 온실 인트로가 시작되고, 같은 순간 날씨가 서서히 나타난다(그 전에는 날씨를 그리지 않는다). 인트로는 페이지가 화면에 보일 때 첫 프레임부터 시작하고, 주소창 때문에 생기는 resize로는 끊기지 않는다. 상태는 `#greenhouse`의 `data-intro`(`waiting` → `playing` → `done`), `#weather`의 `data-weather`(`waiting` → `on`)로 확인한다. 웹 글꼴이 오기 전에는 크기를 맞춘 시스템 글꼴(`Archivo Fallback …`, `Noto Sans KR Fallback`)로 보여서 글꼴이 바뀔 때 줄이 거의 움직이지 않는다 |
| 인사말 | `docs/cover-studies/GreetingCard.html` | 시안, 확정 전. 제목 없음. 검은 면(`#000` + 검은 종이 질감, 화면 전체 폭, 내용은 440px 기둥). 사용자가 준 흰 종이 우표 이미지 한 장 안에 종이 청첩장 표지와 같은 사진 두 장(위 12번, 아래 04번, 컬러, 표지와 같은 구도)을 위아래로 넣음. 톱니 안쪽 네 변 고른 흰 여백, 두 사진 사이는 좁은 흰 띠. 390px 화면에서 우표 약 100×144px. 아래 종이색 글자의 가운데 정렬 인사말. 서명 줄 없음(넣지 않기로 함) |
| 두 사람 | `docs/cover-studies/Families.html` | 사용자가 준 참고 이미지의 구성. 집안마다 혼주 줄(`서재호 & 김선교의`) → 관계·이름(`아들 진용`) → 사람 모양으로 오린 사진 한 장(흰 테두리, 옅은 그림자). 사진은 10번·9번(사용자가 유지하기로 함), 오린 파일은 `photo-NN-cut.webp`(`scripts/BuildCutouts.py`로 만듦) |
| 사진 | `docs/cover-studies/PhotosScrapbook.html` | 14장을 크기가 다른 액자로 종이 위에 비대칭으로 흩어 놓은 스크랩북 페이지(사용자가 준 스크랩북 참고 이미지). 가운데 큰 가로 대표 사진 한 장, 위아래로 작은 사진들이 좌우로 엇갈림. 테두리가 잘리지 않게 모든 사진을 화면 안에 둠. 사진마다 커버 온실 틀 색(`#7f8b8a`)의 손으로 그린 크레용 사각형 테두리(굵은 줄 + 옅은 줄 두 번, 모서리가 조금씩 삐져나감, 4가지 모양을 돌려 씀, 그림자·회전 없음), 장식 그림 없음(사용자 요청으로 뺌). 배치는 cqw 단위라 폭에 따라 비례. 가로 사진은 `--pos`로 잘라 씀. 시안, 확정 전. 이전 필름 스트립(`PhotosFilm.html`)은 지움. 누르면 종이색 화면에 원본 크게 보기(Esc·뒤로 가기로 닫힘) |
| 예식 안내 | `docs/cover-studies/CeremonyInfo.html` | 배치는 사용자 참고 페이지(몽글미 `meadow` 일시 영역)를 따름. 흰 종이, 제목 없음. `2027년 3월 6일 토요일`(크게)·`오후 5시 · 식물관PH` → `2027.03`과 크레파스 선 → 6일에 동그라미 친 달력(S M T…) → 남은 시간(DAYS·HOURS·MINS·SECS, 예식 뒤 숨김) → `캘린더에 추가` 버튼(키트 `.pill`, 잉크색 알약 모양)(Android는 구글 캘린더, 그 밖은 `share/wedding.ics`, iPhone 카카오톡은 Safari로 넘김). 혼주는 두 사람 영역에만 |
| 오시는 길 | `docs/cover-studies/Directions.html` | 시안, 확정 전. 가운데 축. 제목 `오시는 길` → 네이버 지도(끌기 없이 핀 하나, Client ID는 등록한 주소에서만 동작) → `식물관PH`(큰 글자) → 누르면 복사되는 주소 한 줄 → 네이버 지도·카카오맵·티맵 테두리 알약 한 줄(티맵은 PC에서 숨김) → 지하철·주차·셔틀버스(사용자가 준 문구) |
| 마음 전하실 곳 | `docs/cover-studies/GiftAccounts.html` | 시안, 확정 전. 그림 없음. 제목 `마음 전하실 곳` → 안내 문장 → 가운데에 나란히 놓은 신랑측·신부측 접기 → 가운데 계좌(이름 12px, 계좌번호 누르면 복사) |
| 참석 여부 | `docs/cover-studies/Rsvp.html` | 시안, 확정 전. 그림 없음. 제목 `참석 여부` → 측·참석·식사를 가운데에 나란히 놓은 두 단어로 고르고, 이름(가운데 글자)·인원(큰 숫자)을 넣는 양식 → `보내기` 알약 |
| 마무리 | `docs/cover-studies/Closing.html` | 사용자가 고른 방향. 검은 면, 06번 사진 우표, 마지막 인사, 가운데에 위아래로 쌓은 `청첩장 보내기`(`.pill`)·`주소 복사`(`.pill--line`) 알약. 제목·그림 없음(인사말과 처음·끝이 짝) |

- `docs/SectionsSpec.md` 6장에 항목별로 지금 구현과 확정 여부가 있다.
- 마무리의 공유는 `청첩장 보내기`(휴대폰 기본 공유 창)다. 카카오톡 전용 공유는 카카오 앱 키가 있어야 해서 보류. PC처럼 공유 창이 없는 브라우저에서는 `주소 복사`만 가운데에 남는다.
- 공용 키트: `docs/cover-studies/SectionKit.css` / `SectionKit.js` — 커버 뒤 영역이 같이 쓰는 제목·알약 버튼(`.pill`)·크레파스 밑줄·동그라미·글자 크기와 누르면 복사 동작. 고치면 모든 영역에 반영된다. 오시는 길~참석 여부의 제목·여백 규칙은 `.section--detail` 블록에 있다(예식 안내는 이 클래스를 쓰지 않고, 마무리는 여백을 자기 파일에서 덮어쓴다).
- 기획 문서: `docs/SectionsSpec.md` — 영역별 기획, 그림 배정, 만드는 방식, 받아야 할 정보.
- 종이 청첩장 원본: `iCloud Drive/invitation_stamp.pdf` (첫 장 오른쪽이 표지).
- 인사말 우표 종이 이미지: `docs/cover-studies/textures/stamp-frame.png`(595×860, 바깥·구멍 투명). 원본은 `stamp-frame-source.png`(배포하지 않음), 다시 만들기는 `node scripts/BuildStampFrame.mjs docs/cover-studies/textures/stamp-frame-source.png`. **이 우표 이미지는 사용자가 준 것으로 출처·사용 조건은 확인되지 않음(공개 배포 전 확인 필요).**

예전 React 시안(봉투·런칭·에디토리얼·콜라주)은 지웠다. 필요하면 git 이력(`8ff73a6`)에서 꺼낸다. `docs/cover-studies`의 `StarCover`·`FrameCover`·`CoverStudies`와 예전 스펙 문서는 참고용으로만 남겨 둔 것이다.

## 날씨 연동

- Open-Meteo(무료, 키 없음)로 현재 날씨를 30분마다 받아 커버에 연출한다: 맑음·흐림·비·눈·안개·뇌우·밤.
- 위치는 `VENUE_LATITUDE` / `VENUE_LONGITUDE` (지금은 서울 시청 좌표). 식물관PH 정확한 주소를 받으면 바꾼다.
- 흐림의 구름은 테두리 없이 면(`#e9ebec` 한 색)만 그린다.
- 모든 장면은 화면 주사율과 상관없이 시간 기준(초당 px)으로 움직인다. 밤에는 별이 천천히 흐르며 반짝이고, 몇 초에 한 번 별똥별이 짧게 지나간다.
- 주소창이 접히거나 펴져서 생기는 resize로는 입자를 다시 뿌리지 않는다. 캔버스 크기만 다시 잡고 기존 입자를 새 크기에 비례해 옮긴다.
- 미리보기: 주소 끝에 `#clear` `#cloudy` `#rain` `#snow` `#fog` `#storm` `#night`.
- claude.ai 아티팩트 링크에서는 외부 요청이 막혀 실시간 날씨가 안 된다. 배포한 사이트에서만 된다.

## 로컬에서 보기

- `npm ci` 후 `npm run dev`. `/`에 청첩장이 뜨고, 원본을 고치면 다시 만들어 새로고침한다.
- HTTPS 인증서는 작업 폴더마다 만든다: `mkdir -p .certs.local && mkcert -cert-file .certs.local/cert.pem -key-file .certs.local/key.pem localhost 127.0.0.1 ::1`
- 개발 서버도 `site/`를 다시 쓴다. 배포 전에는 아래 2번을 꼭 다시 실행한다.

## 빌드와 배포

`main`에 푸시(또는 PR 병합)하면 Vercel이 알아서 빌드해 https://jinyongharim.com 에 배포한다. Vercel 프로젝트 `wedding-invitation`이 이 GitHub 저장소에 연결되어 있고(2026-11-27), 빌드 방법은 저장소 루트의 `vercel.json`에 있다(`python3 scripts/BuildSite.py https://jinyongharim.com` → `site/`). 배포 주소가 바뀌면 `vercel.json`의 주소도 같이 고친다. `main`이 아닌 브랜치를 푸시하면 미리보기 배포가 만들어진다(네이버 지도는 등록한 주소가 아니라서 숨겨진다).

아래는 푸시 없이 손으로 배포할 때의 순서다.

```bash
# 1. 영역별 파일을 최종본(Invitation.html)으로 합치기
cd docs/cover-studies && python3 ../../scripts/BuildInvitation.py && cd ../..

# 2. 배포용 site/ 만들기 (공유 미리보기 이미지를 절대 주소로)
python3 scripts/BuildSite.py https://jinyongharim.com

# 3. 배포 — git 저장소 밖에서 해야 한다 (아래 주의 참고)
rm -rf /tmp/wedding-site && cp -R site /tmp/wedding-site
cd /tmp/wedding-site && vercel deploy --prod --yes --project wedding-invitation
```

- `BuildSite.py`는 시작할 때 `BuildInvitation.py`를 먼저 돌리므로 1번을 빼먹어도 낡은 `Invitation.html`이 배포되지 않는다.
- **주의**: 테스트도 `site/`를 다시 만들며, 이때 공유 주소가 `https://example.test`로 들어간다. 테스트를 돌렸으면 2번을 다시 실행한 뒤 배포한다.
- `RSVP_ENDPOINT`가 빈 채로 배포하면 하객이 보내기를 눌러도 저장되지 않고 "시안이라 아직 저장되지는 않아요."가 보인다. `BuildSite.py`가 끝에 경고 한 줄을 출력한다(실패는 아님).
- 합치는 순서는 `scripts/BuildInvitation.py`의 `SECTIONS` 목록 하나로 정한다. 영역을 늘릴 때 한 줄만 넣는다. 키트는 결과물에 한 번만 들어간다.
- 영역 파일에서 기대한 부분(스타일, 루트 요소, `aria-label` 등)을 못 찾으면 어느 파일의 무엇이 없는지 알려 주고 멈춘다.
- 화면 밖 사진은 늦게 불러온다: 인사말 우표 종이와 사진 영역의 사진은 모두 `loading="lazy"`.
- `BuildSite.py`는 페이지가 쓰는 사진과 `textures/` 파일만 복사한다(없으면 `site/`를 지우기 전에 알리고 멈춤). 사진 영역은 페이지에 적힌 작은 사진(`photo-NN-sm.jpg`)마다 크게 보기용 원본(`photo-NN.jpg`)을 함께 복사한다(사진 영역 14장과 마무리 우표 1장, 각각 × 2). 인사말은 `photo-12.jpg`·`photo-04.jpg` 원본(사진 영역의 크게 보기용 원본과 같은 파일)과 `textures/stamp-frame.png`, `textures/paper-black.png`를 쓴다. 페이지 배경은 `textures/paper.png`다 두 사람 영역은 오린 사진 `photo-10-cut.webp`·`photo-09-cut.webp`를 쓴다 (지금 사진 32장, 텍스처 3개).
- **주의**: 저장소 안에서 `vercel deploy`를 하면 커밋 작성자 정보가 붙는다. 작성자 이메일이 Vercel 계정 구성원이 아니면 배포가 `Blocked` 된다. 그래서 `site/`를 저장소 밖으로 복사해서 배포한다.
- 이 저장소의 git 작성자는 `서진용 <doublejbs@naver.com>` (저장소 로컬 설정). 새 기기에서는 다시 설정한다:

```bash
git config user.name "서진용"
git config user.email "doublejbs@naver.com"
```

### 파비콘·공유 미리보기 (온실 그림)

- 파비콘과 링크 공유 이미지는 모두 커버의 크레파스 유리 온실이다. 원본은 `docs/cover-studies/share/`에 있고, `BuildSite.py`가 이 폴더의 `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png`와 일정 파일 `wedding.ics`를 `site/` 루트로 복사하고 `<head>`에 파비콘·`og:*`·`twitter:*` 태그를 넣는다. 파일이 하나라도 없으면 어떤 파일인지 알리고 멈춘다.
- `favicon.svg`는 손으로 쓴 아이콘용 온실(16px에서도 읽히게 단순화, 안쪽을 종이색으로 채워 어두운 탭에서도 보임)이다. PNG 두 개는 이 SVG를 크롬으로 렌더링한 것이고, 홈 화면 아이콘은 iOS가 투명 배경을 검게 채우므로 종이색 바탕에 여백을 뒀다.
- `og-image.png`(1200×630)는 커버 캔버스를 그대로 렌더링해 종이색 위 가운데에 놓은 것이다. 글자는 넣지 않았다(카카오톡이 제목·설명을 이미지 아래에 따로 보여 준다). 온실은 가운데 정사각형 안에 있어서 2:1이나 정사각형으로 잘려도 전체가 보인다. 배치는 `share/ShareCard.html`.
- 다시 만들기: `node scripts/BuildShareImages.mjs` (크롬 필요, `CHROME_PATH`로 경로 변경 가능, 웹 글꼴 때문에 온라인에서). 몇 번을 돌려도 같은 그림이 나온다. 커버 그림이나 `favicon.svg`를 고쳤을 때만 돌리고, 결과 PNG는 커밋한다.
- **카카오톡은 링크 미리보기를 캐시한다.** 이미지를 바꿔 배포한 뒤에는 카카오 개발자 사이트의 공유 디버거(https://developers.kakao.com/tool/debugger/sharing)에 배포 주소를 넣고 캐시를 초기화해야 새 이미지가 보인다.

## 테스트

- `npx vitest run`. 영역 HTML은 `src/__tests__/InvitationSections.test.ts`가 본다: 영역 파일의 `<section>`을 붙이고 `SectionKit.js`와 인라인 스크립트를 실행해 예식 안내 배치, 복사(실패 포함), 계좌 접기, 참석 여부 검사, 마무리를 확인한다.
- 이 테스트는 `BuildInvitation.py`와 `BuildSite.py`를 실행해 `Invitation.html`과 `site/`를 다시 쓴다. 영역 파일을 고쳤다면 테스트 뒤 `Invitation.html`이 바뀌는 것이 정상이고 함께 커밋한다. 고치지 않았는데 바뀌면 커밋된 합본이 낡은 것이다.
- 테스트가 `node:fs` 등을 쓰므로 `tsconfig.app.json`의 `types`에 `node`를 넣었다.

## 남은 일

- 인사말부터 마무리까지 하나씩 확정하기
- 자리 표시로 남은 정보 받아 넣기:
  - 계좌에 표시할 혼주 성함 (두 사람 영역에는 넣었음, 공개 여부부터 확인)
  - 예식이 끝나는 시각 (캘린더 일정은 임시로 19시. `share/wedding.ics`와 `CeremonyInfo.html`의 `EVENT_DATES`를 같이 고침)
  - 식물관PH 주소 확인 — 지금 `서울 강남구 광평로34길 24`는 임시
  - 계좌 6건 (신랑측·신부측 각 3건, 지금 `○○은행 000-0000-0000-00`)
  - 마무리 마지막 문장
- 인사말 문구 확정 (지금은 초안: "겨울 끝자락에 만난 두 사람이…")
- 손글씨: 커버 한글 이름을 직접 쓴 손글씨 이미지로 교체 (사진으로 받아 배경 제거). 인사말 서명 줄은 뺐으므로 제외
- 참석 여부 저장 연결: `scripts/RsvpSheet.gs`를 구글 시트에 웹 앱으로 배포하고(방법은 파일 머리 주석), 나온 URL을 `Rsvp.html`의 `RSVP_ENDPOINT`에 넣기. 비어 있는 동안은 보내기를 눌러도 전송하지 않는다
- 날씨 좌표(`VENUE_LATITUDE` / `VENUE_LONGITUDE`)를 식물관PH로 바꾸기
- 원하면 배포 주소를 원하는 이름이나 개인 도메인으로 바꾸기
