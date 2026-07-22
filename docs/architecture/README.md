# 기술 의사결정 원칙

제품 클라이언트는 Expo React Native, Backend는 Kotlin과 Spring Boot 기반 모듈형
모놀리스로 결정했다. PostgreSQL과 Flyway로 기록과 변경 이력을 보존하고, Client와
Backend는 OpenAPI 계약을 기준으로 연결한다. 인증, 오프라인 저장과 배포 환경은 팀의
운영 능력, 개인정보 요구와 비용을 확인한 뒤 별도 결정한다.

## 프로토타입 우선

- Frontend는 mock adapter를 사용하되 실제 API와 동일한 request, response와 error shape를 따른다.
- 화면 코드가 mock 구현을 직접 import하지 않도록 데이터 접근 경계를 둔다.
- 프로토타입에서 검증되지 않은 기능을 위해 Backend 구조를 미리 확장하지 않는다.

## 계약 우선

- API 명세를 타입, validator, fixture와 contract test의 단일 진실 공급원으로 사용한다.
- 공개 범위, 날짜, 페이지네이션, 오류 코드와 동시 수정 규칙을 명시한다.
- 소유자, 공개 프로필 방문자와 향후 공유 링크 방문자의 권한 행렬을 유지한다.
- 공개 응답과 소유자 응답을 별도 모델로 정의한다.

## 결정 기록

프레임워크, 데이터베이스, 인증, 배포 환경과 분석 도구를 선택할 때 다음 내용을
`docs/architecture/decisions/`의 ADR로 남긴다.

- 해결하려는 문제와 제약
- 검토한 대안과 선택 근거
- 프라이버시, 접근성, 운영과 비용 영향
- 되돌리기 전략과 후속 검증

## 승인된 결정

- [ADR-001: Expo 유니버설 프로토타입](decisions/0001-expo-universal-prototype.md)
- [ADR-002: 제품 클라이언트와 Backend 기술 스택](decisions/0002-client-and-backend-stack.md)
- [ADR-003: 내부 알파 초대 계정과 불투명 세션](decisions/0003-internal-alpha-authentication.md)
