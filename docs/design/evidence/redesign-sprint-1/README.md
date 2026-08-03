# 재설계 스프린트 1 시각 검수 증거

## 캡처 환경

- 날짜: 2026-08-03
- 실행: Expo SDK 57 Web, mock API, Pretendard 로컬 번들 폰트
- viewport: 390×844, 430×932
- 검수 경로: 로그인 → 나 → 질문 → 600자 자유 입력 → 공개 선택
- 주의: Web 캡처는 모바일 레이아웃의 보조 증거다. Native의 200% font scale과 화면 키보드
  동시 조건은 Android·iOS 실기기 게이트에서 별도로 확인해야 한다.

## 캡처 목록

- `390-home-empty.png`, `430-home-empty.png`: 빈 기록 홈과 공개 정책 문구
- `390-home-record.png`, `430-home-record.png`: 기록 카드가 있는 홈과 하단 내비게이션
- `390-question-choice.png`, `430-question-choice.png`: 선택형 질문과 60pt option, 하단 navigation 위 action
- `390-question-600.png`, `430-question-600.png`: 600자 입력, counter와 저장·건너뛰기 접근
- `390-share-private-record.png`, `430-share-private-record.png`: 비공개 SceneCard와 52pt 공개 범위 control
- `390-share-confirm-dialog.png`, `430-share-confirm-dialog.png`: 공개 대상·제외 정보와 초기 focus를 보여주는 dialog
- `390-preview-record.png`, `430-preview-record.png`: 저장 전 방문자 동일 미리보기와 공개 확정 action
- `390-public-profile.png`, `430-public-profile.png`: 소유자 control이 없는 실제 공개 프로필

## 확인 결과

- 두 viewport에서 document 가로 overflow 없이 20px gutter와 단일 열을 유지한다.
- 홈 cover는 280px이고 이름·intro 공개와 기록별 공개를 서로 다른 문장으로 설명한다.
- 질문 option, 입력과 action은 같은 100% 폭 기준선을 사용하며 action이 콘텐츠를 가리지 않는다.
- 600자 입력에서 `600/600`, 저장, 건너뛰기와 하단 탭이 한 여정 안에서 접근 가능하다.
- 공개 전환은 대상 현재 문장과 공개 제외 정보를 보여주는 blocking dialog를 거친다.
- dialog가 열리면 앱 frame은 `aria-hidden`과 pointer 차단 상태가 되며 dialog 행동만 접근성 이름으로 조회된다.
- dialog에서 미리보기로 이동한 후 이전 Modal이 남지 않으며, 공개 프로필은 소유자 control을 직렬화하지 않는다.

## 검수 판정

- Product Designer: Web 핵심 흐름 `Approved`, Blocker 0·Major 0·Minor 0
- Independent Reviewer: 개인정보·공개 의미·focus 핵심 흐름 Major 0
- 공식 전체 출고 게이트: 미승인. 화면별 로딩·오류·권한·실패 상태 매트릭스,
  동일 commit 시각 회귀 CI와 아래 Native 증거가 남아 있다.

## 남은 Native 게이트

- 390×844·430×932의 Android·iOS 200% font scale 캡처
- 600자·200%·화면 키보드 동시 상태의 저장·건너뛰기 조작
- VoiceOver·TalkBack의 dialog focus trap, 취소 후 focus 복귀와 축소 모션 확인
