# it'sME server

Kotlin, Spring Boot 4.1, JDBC, PostgreSQL과 Flyway로 구성한 내부 알파 Backend다.
공개 API 계약은 `../../contracts/openapi/itsme.yaml`이 단일 진실 공급원이다.

## 로컬 실행

저장소 루트에서 `docker compose up -d postgres`를 실행한 뒤 이 디렉터리에서
`./gradlew bootRun`을 실행한다. 기본 포트는 `8080`, 기본 데이터베이스는
`jdbc:postgresql://localhost:5432/itsme`와 개발 전용 계정 `itsme/itsme`다.

다음 환경 변수로 설정을 덮어쓸 수 있다.

- `SERVER_PORT`, `DB_URL`, `DB_USER`, `DB_PASSWORD`
- `SESSION_TTL` (기본 `7d`, 인증 활동마다 연장)
- `CORS_ALLOWED_ORIGIN_PATTERNS` (쉼표 구분, 배포 환경에서는 정확한 HTTPS origin만 지정)
- `BOOTSTRAP_ENABLED`, `BOOTSTRAP_EMAIL`, `BOOTSTRAP_PASSWORD`, `BOOTSTRAP_DISPLAY_NAME`, `BOOTSTRAP_SLUG`

자가 가입 API는 없다. 초대 계정이 필요할 때만 bootstrap 변수를 프로세스 환경에 넣고
`BOOTSTRAP_ENABLED=true`로 한 번 실행한다. 평문 비밀번호는 DB나 로그에 저장하지 않는다.

## 데이터와 공개 정책

- Bearer token은 256-bit 난수이며 DB에는 SHA-256 digest만 저장한다.
- 로그인 실패는 계정 hash와 직접 접속 IP 조합으로 제한하며 원문 이메일을 rate-limit 상태에 남기지 않는다.
- 새 기록은 요청과 무관하게 `private`으로 생성한다.
- 공개 기록 수정은 자동으로 `private` 전환하여 다시 공개하는 명시적 동의를 요구한다.
- 공개 후보는 10분·1회용 미리보기 token과 현재 버전에 결합하며 token 없는 공개 전환을 거절한다.
- 공개 API는 내부 record ID 없는 별도 projection으로 최신 공개 답변만 반환하고
  `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow, noarchive`를 보낸다.
- 계정 접근을 회수하면 기존 세션을 모두 폐기하고 이후 로그인도 같은 자격 증명 오류로 거절한다.
- 기록 삭제는 FK cascade로 현재 기록, 모든 버전과 맥락을 같은 트랜잭션에서 영구 제거한다.

## 검증

`./gradlew clean test`는 Kotlin 컴파일, Flyway 마이그레이션, 인증·소유권 행렬,
공개 projection과 OpenAPI 경계 테스트를 실행한다. 로컬은 PostgreSQL 호환 H2를 쓰고,
CI는 PostgreSQL 17 service에 같은 테스트를 실행한다.
