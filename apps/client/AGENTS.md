# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## 잇츠미 클라이언트 규칙

- 화면은 `ItsmeApi` port에만 의존하며 mock adapter를 직접 import하지 않는다.
- 공개 미리보기와 방문자 화면은 같은 `PublicProfile` 응답과 렌더러를 사용한다.
- 자유 서술을 로그, URL, 분석 이벤트 또는 자동 영속 저장소에 남기지 않는다.
- 새 기록의 공개 기본값과 서버 계약의 최종 기본값은 항상 `private`다.

## 프로젝트 변경 이력

- 2026-07-14: Expo SDK 57 유니버설 앱, 계약 기반 mock, 핵심 자기 탐색·변화·공개
  프로토타입과 테스트를 추가했다.
- 2026-07-14: 초기 오류 재시도, 공개 slug 검증, 방문자 화면 분리와 200% 확대 대응을 추가했다.
- 2026-07-14: `ITS ME / LIVE INDEX` 시각 체계, 6개 Identity Bands, Black Han Sans 표시
  서체, 고대비 반응형 내비게이션과 iOS·Android·EAS 배포 설정을 추가했다.
- 2026-07-14: 공개 route의 API 초기화를 owner route와 분리하고 `/p/me` 정적 생성을
  추가해 익명 공개 프로필의 데이터 경계와 직접 진입을 보강했다.
- 2026-07-20: 한국형 프로필·기록 앱을 참고한 `나의 장면` 시각 체계, 밝은 반응형 내비게이션,
  자연 높이 기록 모듈과 한국어 중심 질문·변화·공개 화면을 적용했다.
- 2026-07-20: `it’sME` 워드마크와 `Scene M` 벡터 심볼을 공용 컴포넌트로 추가하고
  iOS·Android·Web 앱 아이콘과 스플래시 자산을 교체했다.
- 2026-07-20: 클라이언트를 최대 480px 모바일 전용 레이아웃으로 전환하고 20px 화면 여백,
  전체 폭 질문·선택지·버튼, 균등 하단 탭과 모바일 키보드 인셋을 모든 화면에 적용했다.
- 2026-07-20: 장식용 파스텔 배경과 과도한 타이포를 제거하고 인디고 중심 `Scene M` 팔레트,
  흰 카드·4px 범주 표식으로 정돈했으며 기록 삭제와 전체 질문 완료 흐름을 보강했다.
- 2026-07-22: 초대 계정 로그인, Native SecureStore·Web sessionStorage 세션, OpenAPI 생성 타입,
  실제 HTTP adapter와 mock 모드, 보호 라우트·401 재로그인 및 익명 공개 프로필 경계를 추가했다.
- 2026-07-22: 공개 DTO에서 내부 기록 ID를 제거하고 버전 조건부 수정, token 기반 공개 전 미리보기,
  멱등 삭제·계정 전환 격리, 배포 API fail-closed와 내부 알파 검색 색인 차단을 추가했다.
- 2026-07-29: Expo SDK 57 호환 범위와 OpenAPI 생성 도구의 peer dependency를 함께 만족하도록
  TypeScript를 5.9 계열로 정렬해 GitHub Actions의 재현 가능한 설치를 복구했다.
- 2026-07-29: Expo SDK 57 패치 의존성을 정렬하고 EAS environment별 공개 API 사전 검증,
  전 플랫폼 bundle export와 Android·iOS Maestro 내부 알파 스모크 워크플로를 추가했다.
- 2026-08-03: semantic token과 `ScreenHeader`, `SceneCard`, `BottomActionBar`, `StatePanel`,
  `BlockingDialog`, Pretendard 번들 폰트를 추가하고 핵심 화면을 390·430px 단일열과 200% 확대
  규칙에 맞춰 재구성했다.
- 2026-08-03: 공개 route 상태를 owner projection과 분리해 slug 전환 경쟁 상태를 제거하고,
  공개 정책 카피·600자 counter·삭제 dialog와 관련 회귀 테스트·Web 시각 증거를 보강했다.
- 2026-08-03: 공개 확인 dialog의 Web·Native 배경 차단 경계와 초기·복귀 focus를 보강하고,
  공개 미리보기 전환 후 stack에 이전 modal이 남지 않도록 상태를 먼저 초기화했다.
- 2026-08-03: Expo 57.0.9·React Native 0.86.2와 연관 패치 패키지를 정렬하고 잠금 파일을
  깨끗하게 재생성해 CI의 `expo install --check`가 최신 호환 매트릭스를 통과하도록 했다.
- 2026-08-04: `문장 표지 / Living Folio` 방향으로 warm paper token과 MaruBuri 번들 서체,
  `FolioHeader`·`FolioCover`·`FolioEntry`·`PromptSheet`·`ChoiceList`·`VisibilityRow`·
  `ShareProofDialog`·`PublicFolioRenderer`를 추가하고 전체 핵심 화면의 카드·큰 제목·고정 하단
  행동을 문장 중심의 자연 높이 흐름으로 교체했다.
- 2026-08-04: 200% 확대 시 메타·공개 행 세로 적층, dialog Web focus trap, 질문명을 포함한
  접근성 이름, 축소 모션 안전 복구를 추가하고 Expo 57 기대값에 맞춰
  `react-native-gesture-handler`를 `~3.1.0`으로 정렬했다.
- 2026-08-04: 독립 QA를 반영해 확대 시 entry 메타·공개 상태를 세로로 쌓고 dialog Web focus
  trap·배경 차단 회귀 테스트, Scene Register 규격, 홈 중복 제거와 축소 모션 대응 reveal을 보강했다.
