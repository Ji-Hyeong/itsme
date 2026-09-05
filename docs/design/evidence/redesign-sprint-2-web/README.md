# Living Folio Web 검수 증거

2026-08-04 `codex/internal-alpha`의 Expo Web 렌더를 실제 브라우저에서 직접 조작해
저장했다. 이 증거는 모바일 폭에서 정보 구조, 정렬과 공개 흐름을 확인하기 위한 보조
자료다. 최종 16장은 아래 소스 커밋을 실행해 같은 mock 여정을 반복한 결과다.

## 환경

- 소스 커밋: `a553dbfe33284bcc51624e6e6f6d79342b4f177a`
- 앱·빌드: `1.0.0`, Expo SDK 57, local mock export
- 캡처: 2026-08-04 15:20–15:40 KST, macOS 26.5.2, Chrome 150.0.7871.187
- 플랫폼: Expo Web, 로컬 mock API, `ko-KR`
- 브라우저 주소: `http://127.0.0.1:8082`
- 뷰포트·pixel ratio: `390x844`·`430x932`, `1x`
- 표시 설정: 글자 배율 `100%`, 밝은 모드, 고대비 해제, 축소 모션 해제
- fixture: 초대 계정, 기록 0개에서 시작, `좋아하는 색`에 `이끼 초록` 선택,
  새 기록 `나만 보기`, 공개 확인 후 공개 전환
- 데이터 흐름: 세션 복원, 질문 선택, 기록 저장, 공개 확인, 방문자 화면 진입

## 포함 화면

- `me--empty`: 기록이 없는 홈
- `me--record`: 기록이 있는 홈
- `question--choice`, `question--selected`: 질문 기본·선택 상태
- `share--private`, `share--dialog`: 비공개 기본값과 공개 확인 대화상자
- `preview--record`, `public--record`: 공개 전 미리보기와 방문자 화면
- `timeline--empty`: 이전 기록이 없는 변화 화면의 보조 캡처

모든 파일은 이름과 동일한 `390x844` 또는 `430x932`의 실제 PNG다. 최종 화면 비교는
`me`, `question`, `share`, `preview`, `public`의 두 뷰포트 16장을 사용했다.

## 승인

- Product Designer: Web 핵심 시각 흐름 `Approved with recorded Minor difference`
  (`Blocker 0`, `Major 0`, `Minor 1`)
- Reviewer: 구현 `Approved` (`Blocker 0`, `Major 0`, `Minor 0`)
- 기록된 Minor: 종이 질감 `FolioGrain`은 실제 화면에서 식별되지 않으며 구조 승인 후
  보강 가능한 시각 부채로 남긴다.

## 판정 범위

Web 증거는 390px·430px 기준선과 브라우저 접근성 트리 검수에는 사용할 수 있지만,
Native 완료 증거를 대신하지 않는다. iOS·Android의 200% 글자 확대, 키보드·safe area,
VoiceOver·TalkBack, 축소 모션과 실제 터치 영역, 로딩·오류·권한·삭제·긴 콘텐츠 상태는
별도의 실기기·상태 매트릭스 검수가 필요하다.
