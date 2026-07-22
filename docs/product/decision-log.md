# 제품 결정 기록

## D-001: 제품 이름

- 날짜: 2026-07-14
- 상태: 승인
- 결정: 국내 제품 이름을 `잇츠미`로 사용한다.
- 근거: `myStatus`보다 따뜻하고 기억하기 쉬우며 자기표현과 자기수용을 함께 전달한다.
- 후속 확인: 영문 표기, 도메인, 앱스토어 이름과 상표 충돌은 출시 전 별도 검토한다.

## D-002: 제품 중심

- 날짜: 2026-07-14
- 상태: 승인
- 결정: 소셜 피드보다 자기이해, 회고와 현재의 나 화면을 제품의 중심으로 둔다.

## D-003: 공개 기본값

- 날짜: 2026-07-14
- 상태: 승인
- 결정: 모든 새 자기 기록은 `나만 보기`를 기본값으로 사용한다.

## D-004: 구현 순서

- 날짜: 2026-07-14
- 상태: 승인
- 결정: 제품 정의와 UX 흐름을 먼저 검증하고, 계약 기반 mock 프로토타입 이후 Backend를 구현한다.

## D-005: 첫 프로토타입 구현 기반

- 날짜: 2026-07-14
- 상태: 승인
- 결정: Expo 유니버설 앱으로 모바일 경험과 공개 프로필 Web을 함께 검증한다.
- 범위: 시작, 질문 3개, 현재의 나, 기록 갱신, 변화, 공개 선택과 미리보기다.
- 근거: `docs/architecture/decisions/0001-expo-universal-prototype.md`에 기록한다.

## D-006: 제품 Client와 Backend 기술 스택

- 날짜: 2026-07-14
- 상태: 승인
- 결정: 제품 Client는 Expo React Native를 유지하고, Backend는 Kotlin과 Spring Boot 기반
  모듈형 모놀리스와 PostgreSQL·Flyway로 구현한다.
- 계약: Client와 Backend는 OpenAPI를 단일 진실 공급원으로 사용하며 서버 interface, DTO,
  TypeScript client와 validator를 생성한다.
- 배포 전 조건: iOS bundle identifier, Android package, EAS 환경별 build profile, 앱 자산,
  권한 설명, 딥 링크와 서명 자격 증명 관리 방식을 확정한다.
- 근거: `docs/architecture/decisions/0002-client-and-backend-stack.md`에 기록한다.
