# 에이전트 운영 가이드

## 구성

프로젝트 에이전트는 `.codex/agents/`에 정의되어 있다.

- `itsme_po`: 제품 문제, 범위, 정책과 인수 기준
- `itsme_product_designer`: UX, 정보 구조, 디자인 시스템과 접근성
- `itsme_frontend`: 프로토타입, 클라이언트와 화면 테스트
- `itsme_backend`: 도메인, API, 인증·인가와 데이터 보호
- `itsme_reviewer`: 독립 리뷰와 잔존 위험 보고

Main/Orchestrator는 사용자와의 대화, 최종 결정, 작업 분배와 결과 통합을 담당한다.

## 권장 실행 파동

현재 동시 실행 한도는 Main을 포함해 다섯 개다. 쓰기 충돌을 줄이기 위해 다음 순서를 사용한다.

1. 발견: Main + PO + Product Designer + 필요한 읽기 전용 조사
2. 프로토타입: Main + Product Designer + Frontend + Reviewer
3. 실제 연동: Main + Frontend + Backend + Reviewer

## 디자인 품질 스쿼드

화면의 구조, 스타일, 문구, 모션 또는 반응형 동작이 바뀌는 작업에는 역할 정의만
참고하지 않고 Main이 아래 세 에이전트를 실제로 호출한다.

1. `itsme_product_designer`가 레퍼런스 원리, 정보 위계, 화면 상태와 검증 가능한 명세를 승인한다.
2. `itsme_frontend`가 승인된 명세만 구현하고 390x844와 430x932 실제 렌더 캡처를 제출한다.
3. `itsme_reviewer`가 정렬, 길이, 글자 확대, 접근성, 제품 철학과 회귀를 독립적으로 반려하거나 통과시킨다.

Frontend는 자신의 결과를 스스로 승인할 수 없다. Designer와 Reviewer 중 하나라도
반려하면 Main은 완료로 보고하거나 GitHub에 병합하지 않고, 수정과 재캡처를 반복한다.
브라우저 미리보기만으로 Native 품질을 확정하지 않으며 실제 기기 확인이 불가능하면
그 항목을 명시적인 릴리스 차단 조건으로 남긴다.

## 요청 예시

```text
itsme_po와 itsme_product_designer 에이전트에게 온보딩 MVP를 병렬 검토하게 해줘.
PO는 범위와 인수 기준, Designer는 사용자 흐름과 예외 상태를 맡게 하고,
둘의 결과가 모두 도착하면 충돌과 미결정을 통합해줘.
```

```text
itsme_frontend는 승인된 흐름을 계약 기반 mock으로 구현하고,
itsme_reviewer는 구현이 끝난 뒤 접근성·프라이버시·회귀 위험을 읽기 전용으로 검토하게 해줘.
```

## 협업 규칙

- 병렬 에이전트에는 서로 겹치지 않는 파일 또는 읽기 전용 과제를 할당한다.
- 제품 범위는 PO, 경험 표현은 Designer, 기술 구현은 각 Engineer가 제안한다.
- 공유 계약을 바꿀 때는 영향받는 역할의 검토를 받은 뒤 Main이 통합한다.
- 에이전트 결과는 근거, 결정, 미확정 사항, 검증 결과와 남은 위험으로 요약한다.
- 반복되는 오류나 운영 마찰은 회고 후 `AGENTS.md`에 짧고 구체적인 규칙으로 추가한다.
- UI 변경은 `docs/design/design-quality-gate.md`의 증거와 승인 조건을 충족해야 한다.
