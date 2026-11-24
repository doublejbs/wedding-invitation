# 로컬 서버

- 저장소에는 지금 작업 중인 청첩장(`docs/cover-studies/`)만 남긴다. 예전 React 시안(봉투·런칭·에디토리얼·콜라주)과 그 전용 파일·의존성은 없앤다.
- `npm run dev`: `site/`를 만들어 `/`로 서빙한다. 원본이나 빌드 스크립트를 고치면 다시 만들고 새로고침한다.
- `.certs.local/`에 인증서가 있으면 HTTPS로 뜬다.
- `npm run build`: 타입 검사 뒤 `site/`를 만든다. 배포 전에는 배포 주소를 넣어 `BuildSite.py`를 다시 실행한다.
