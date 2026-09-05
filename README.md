# 잇츠미 (it’sME)

다른 사람에게 보여주기 위한 SNS보다 자신의 성격, 취향, 강점과 변화의 기록을 쌓으며
스스로를 이해하는 데 초점을 둔 모바일 앱입니다.

## 현재 구현

- Expo와 React Native 기반 Android·iOS 클라이언트
- Kotlin·Spring Boot, PostgreSQL·Flyway 기반 Backend
- 초대 계정 인증, 세션 복원과 로그인 시도 제한
- 비공개 기록, 버전 관리, 공개 미리보기와 공개 프로필
- OpenAPI 계약으로 연결한 HTTP adapter와 같은 계약을 사용하는 메모리 mock
- Server 통합 테스트와 Client 테스트·lint·타입 검사를 실행하는 GitHub Actions

현재는 실제 Client와 Backend를 연결해 핵심 흐름을 검증하는 내부 알파 단계입니다. Web 빌드는
모바일 화면을 빠르게 확인하기 위한 미리보기로 사용합니다.

## AI와 작업한 방식

제품 기획, 디자인, Frontend, Backend와 Review 역할을 나누고 각 역할의 책임과 수정 범위를
`.codex/agents`에 명시했습니다. Main 역할이 최종 범위와 공유 계약을 결정하고, 역할별 결과를
하나의 제품 흐름으로 통합합니다. 자세한 작업 순서와 충돌 방지 기준은
[에이전트 운영 가이드](docs/agent-playbook.md)에 정리했습니다.

AI가 만든 결과를 바로 반영하지 않고 다음 기준으로 검증합니다.

- 제품 원칙과 인수 기준을 먼저 정하고 구현 결과가 이를 만족하는지 확인합니다.
- OpenAPI 계약을 기준으로 Server와 Client 타입을 맞추고 생성 결과의 변경을 검사합니다.
- Server 통합 테스트와 Client 테스트·lint·타입 검사로 기능과 회귀를 확인합니다.
- 모바일 핵심 화면은 두 가지 뷰포트와 글자 확대 조건에서 별도 Review를 거칩니다.

## 내부 알파 실행

먼저 PostgreSQL을 실행하고 초대 계정을 한 번만 생성한 뒤 Server를 시작합니다. 아래 값은 로컬
개발 예시이며 실제 비밀번호는 저장소에 기록하지 않습니다.

```bash
docker compose up -d postgres

cd apps/server
BOOTSTRAP_ENABLED=true \
BOOTSTRAP_EMAIL=invited@example.com \
BOOTSTRAP_PASSWORD='replace-with-a-local-password' \
BOOTSTRAP_DISPLAY_NAME='지금의 나' \
BOOTSTRAP_SLUG='my-scene' \
./gradlew bootRun
```

계정이 생성되면 다음 실행부터 `BOOTSTRAP_ENABLED`를 제거합니다. 다른 터미널에서 Client를 실제
API 모드로 시작합니다.

```bash
cd apps/client
npm install
EXPO_PUBLIC_API_MODE=http \
EXPO_PUBLIC_API_URL=http://127.0.0.1:8080 \
npm run web
```

Docker 없이 UI만 확인하려면 Client의 API 환경 변수를 생략해 메모리 mock을 사용할 수 있습니다.
EAS preview·production 환경 설정과 Android·iOS 스모크 절차는
[Client 실행 문서](apps/client/README.md)에 정리했습니다.

## 검증

```bash
cd apps/server
./gradlew clean test

cd ../client
npm test
npm run lint
npm run typecheck
npm run test:build-env
npm run build:all
```

## 문서

- [제품 비전](docs/product/vision.md)
- [제품 원칙](docs/product/principles.md)
- [MVP 범위](docs/product/mvp.md)
- [내부 알파 범위와 인수 기준](docs/product/internal-alpha.md)
- [프라이버시 원칙](docs/product/privacy.md)
- [내부 알파 인증·공개 UX](docs/design/internal-alpha-auth.md)
- [에이전트 운영 가이드](docs/agent-playbook.md)
- [기술 의사결정 원칙](docs/architecture/README.md)
- [Client와 Backend 기술 스택 ADR](docs/architecture/decisions/0002-client-and-backend-stack.md)
- [내부 알파 인증 ADR](docs/architecture/decisions/0003-internal-alpha-authentication.md)
