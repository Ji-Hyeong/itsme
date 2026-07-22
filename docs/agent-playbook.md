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

현재 동시 실행 한도는 Main을 포함해 네 개다. 쓰기 충돌을 줄이기 위해 다음 순서를 사용한다.

1. 발견: Main + PO + Product Designer + 필요한 읽기 전용 조사
2. 프로토타입: Main + Product Designer + Frontend + Reviewer
3. 실제 연동: Main + Frontend + Backend + Reviewer

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
