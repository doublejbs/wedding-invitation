# 진용·하림 모바일 청첩장 — 인수인계

다른 기기나 계정에서 이어서 작업할 때 이 문서부터 읽는다.

## 기본 정보

- 신랑 서진용 (Seo Jinyong), 신부 장하림 (Jang Harim)
- 2027년 3월 6일 토요일 오후 5시, 식물관PH (유리 온실 예식장)
- 배포 주소: https://wedding-invitation-beta-sand.vercel.app (Vercel 프로젝트 `wedding-invitation`, 계정 doublejbs)
- 저장소: https://github.com/doublejbs/wedding-invitation (비공개)

## 진행 방식

- 영역을 하나씩 정해서 같이 다듬고, 확정하면 다음 영역으로 넘어간다.
- 순서: 커버 → 인사말 → 사진 → 예식 안내 → 오시는 길 → 마음 전하실 곳 → 참석 여부 → 마무리
- 지금까지 확정: **커버, 인사말, 사진**. 다음 차례는 **예식 안내**.

## 디자인 톤 (모든 영역 공통)

- 흰 종이(#fbfbf8) 위에 그림자 없이 평평하게. 입체감은 크레파스 그림이 맡는다.
- 제목은 "단어 – 작은 크레파스 그림 – 단어" 구조, 화면 중심축에 맞춘다 (예: `WEDDING 💍 INVITATION`, `GREETING 🌿 인사말`).
- 좌우 정보는 가운데 기준으로 마주 보게 놓는다.
- 글꼴: 영문 Archivo 500, 한글 Noto Sans KR. 그림 색: 초록 잎, 붉은 꽃, 금색 반지.
- 한 영역에 그림은 하나만. 정보가 많은 영역은 글자 위주로.

### 하지 말 것 (사용자가 싫어한 것)

- AI·템플릿 느낌: `01 — GREETING` 같은 번호 라벨, 표, 테두리 버튼, 고르게 흩뿌린 사진
- 레퍼런스를 그대로 베낀 배치 (바른손 별 청첩장의 가운데 정렬 제목·Groom/Bride 두 칸 등)
- 각주, 영문 장소 표기(Sikmulgwan PH), 사진 영역 제목
- 슬라이드 필름 틀, 콜라주·스크랩북 시안
- 핑크·레이스·리본은 물어보고 넣는다 (레이스는 한 번 요청했었음)

## 영역별 상태

| 영역 | 파일 | 내용 |
|---|---|---|
| 커버 | `docs/cover-studies/GreenhouseCover.html` | 제목 `WEDDING INVITATION`, 이름 줄 `Seo Jinyong 💍 Jang Harim` (한글 이름은 영문 가운데 아래, 반지는 두 줄 높이 중앙에서 반짝임), 크레파스 유리 온실이 바닥부터 식물로 차오름(붉은 꽃 버진로드), 아래 `2027 / 03.06` ↔ `토요일 오후 5시 / 식물관PH`. 예식장 실시간 날씨 연출 |
| 인사말 | `docs/cover-studies/GreetingCard.html` | `GREETING 🌿 인사말` 제목, 크레파스 테두리 사진 한 장, 가운데 정렬 고딕 인사말 |
| 사진 | `docs/cover-studies/PhotosFlow.html` | 제목 없음. 아이팟 커버플로(반사 없음, 글자 없음), 사진마다 크레파스 테두리. 14장 |

다른 시안(`index.html` 봉투, `launch.html`, `editorial.html`, `collage.html`, `docs/cover-studies`의 `StarCover`·`FrameCover`·`CoverStudies`)은 참고용으로만 남겨 둔 것이다.

## 날씨 연동

- Open-Meteo(무료, 키 없음)로 현재 날씨를 30분마다 받아 커버에 연출한다: 맑음·흐림·비·눈·안개·뇌우·밤.
- 위치는 `VENUE_LATITUDE` / `VENUE_LONGITUDE` (지금은 서울 시청 좌표). 식물관PH 정확한 주소를 받으면 바꾼다.
- 미리보기: 주소 끝에 `#clear` `#cloudy` `#rain` `#snow` `#fog` `#storm` `#night`.
- claude.ai 아티팩트 링크에서는 외부 요청이 막혀 실시간 날씨가 안 된다. 배포한 사이트에서만 된다.

## 빌드와 배포

```bash
# 1. 영역별 파일을 최종본으로 합치기
cd docs/cover-studies && python3 ../../scripts/BuildInvitation.py && cd ../..

# 2. 배포용 site/ 만들기 (공유 미리보기 이미지를 절대 주소로)
python3 scripts/BuildSite.py https://wedding-invitation-beta-sand.vercel.app

# 3. 배포 — git 저장소 밖에서 해야 한다 (아래 주의 참고)
rm -rf /tmp/wedding-site && cp -R site /tmp/wedding-site
cd /tmp/wedding-site && vercel deploy --prod --yes --project wedding-invitation
```

- **주의**: 저장소 안에서 `vercel deploy`를 하면 커밋 작성자 정보가 붙는다. 작성자 이메일이 Vercel 계정 구성원이 아니면 배포가 `Blocked` 된다. 그래서 `site/`를 저장소 밖으로 복사해서 배포한다.
- 이 저장소의 git 작성자는 `서진용 <doublejbs@naver.com>` (저장소 로컬 설정). 새 기기에서는 다시 설정한다:

```bash
git config user.name "서진용"
git config user.email "doublejbs@naver.com"
```

## 남은 일

- 예식 안내, 오시는 길, 마음 전하실 곳, 참석 여부, 마무리 영역 만들기 (위 디자인 톤으로)
- 인사말 문구 확정 (지금은 초안: "겨울 끝자락에 만난 두 사람이…")
- 손글씨: 인사말·서명·커버 한글 이름을 직접 쓴 손글씨 이미지로 교체 (사진으로 받아 배경 제거)
- 혼주 성함, 계좌, 식물관PH 주소·교통 정보 받기
- 날씨 좌표를 식물관PH로 바꾸기
- 원하면 배포 주소를 원하는 이름이나 개인 도메인으로 바꾸기
