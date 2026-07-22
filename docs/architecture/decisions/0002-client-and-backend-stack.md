# ADR-002: 제품 클라이언트와 Backend 기술 스택

- 날짜: 2026-07-14
- 상태: 승인

## 맥락

잇츠미는 iOS와 Android 앱을 우선 제공하면서 공개 프로필을 Web에서도 확인할 수 있어야 한다.
현재 Expo 프로토타입은 화면 흐름과 API port를 이미 React Native로 구현했으므로 이 자산을
유지할 수 있다. 실제 서비스 전환을 위해서는 개인정보 공개 범위를 서버에서 강제하고,
기록의 과거 버전을 보존하는 Backend와 양쪽 구현이 공유할 명시적인 API 계약이 필요하다.

## 결정

### Client

- Expo, React Native, Expo Router와 strict TypeScript를 제품 클라이언트 기반으로 유지한다.
- 화면은 `ItsmeApi` port에 의존하고 composition root에서 mock 또는 HTTP adapter를 주입한다.
- 소유자 모델과 공개 프로필 모델을 분리하며, 공개 미리보기와 방문자 화면은 같은 공개
  응답 모델과 렌더러를 사용한다.
- 앱 배포 전 `ios.bundleIdentifier`, `android.package`, 앱 아이콘·스플래시·권한 설명과
  `eas.json`의 development, preview, production profile을 명시한다.
- iOS와 Android 실제 기기에서 접근성, 딥 링크, 키보드, 글자 확대와 축소 모션을 검증하고
  스토어 서명 자격 증명과 환경별 API 주소는 저장소에 평문으로 보관하지 않는다.

### Backend

- Kotlin과 Spring Boot 기반의 모듈형 모놀리스를 `apps/server`에 구성한다.
- 초기 모듈 경계는 `identity`, `profile`, `record`, `question`, `sharing`, `common`으로 두며,
  모듈 간 호출은 공개 application interface를 통한다.
- PostgreSQL을 영구 저장소로 사용하고 Flyway로 모든 스키마 변경을 순서대로 관리한다.
- 자기 기록의 현재 값과 과거 버전을 분리해 변경 시 과거 원문, 맥락과 시점을 덮어쓰지 않는다.
- 공개 조회는 소유자 aggregate의 직렬화를 재사용하지 않고 공개 전용 query와 projection으로
  구성하며 공개 범위는 서버에서 최종 강제한다.

### API 계약

- `contracts/openapi/itsme.yaml`을 request, response, 오류와 동시 수정 규칙의 단일 진실
  공급원으로 사용한다.
- OpenAPI에서 Kotlin 서버 interface와 DTO, TypeScript HTTP client와 Zod validator를 생성하며
  생성물은 직접 편집하지 않는다.
- 소유자 응답과 공개 응답을 별도 schema로 정의하고 contract test에서 공개 JSON에 과거 버전,
  작성 맥락, 변경 이유와 다음 시도가 포함되지 않음을 검증한다.

## 검토한 대안

### React Web과 네이티브 앱 분리

플랫폼별 최적화에는 유리하지만 현재 검증한 React Native 화면과 계약을 중복 구현해야 하고
초기 제품의 변경 속도를 낮춘다.

### 처음부터 분산 서비스로 구성

독립 배포에는 유리하지만 아직 검증되지 않은 도메인 경계를 운영 복잡도로 고정한다. 모듈형
모놀리스가 현재 규모에서 트랜잭션, 개인정보 경계와 변경 비용을 더 명확하게 관리한다.

## 테스트와 운영 영향

- Client는 adapter contract test, 화면 상호작용 테스트와 iOS·Android 실제 기기 검증을 수행한다.
- Backend는 도메인 단위 테스트, MockMvc 권한·오류 테스트, Testcontainers PostgreSQL 통합
  테스트, Flyway 마이그레이션 테스트와 OpenAPI contract test를 수행한다.
- 인증 방식, 오프라인 저장, Backend 배포 환경과 관측 도구는 개인정보 및 운영 요구를 확인한
  뒤 후속 ADR에서 결정한다.

## 되돌리기

OpenAPI 계약과 도메인 규칙을 프레임워크 및 저장소 구현과 분리한다. 향후 공개 Web을 별도
클라이언트로 나누거나 Backend 모듈을 독립 서비스로 분리하더라도 계약과 도메인 테스트를
유지한 채 adapter와 배포 단위만 교체한다.
