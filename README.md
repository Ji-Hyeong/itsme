# 잇츠미 (It's Me)

잇츠미는 남에게 자신을 증명하기 위한 SNS가 아니라, 사용자가 자신의 성격,
취향, 강점, 서툰 점과 변화의 흔적을 기록하며 스스로를 이해하도록 돕는 앱입니다.

## 현재 단계

Expo React Native 모바일 클라이언트와 Kotlin·Spring Boot, PostgreSQL·Flyway Backend를
연결한 내부 알파를 구현했습니다. Android와 iOS가 제품 대상이며 Web 빌드는 모바일 화면을
빠르게 검증하는 미리보기입니다. 클라이언트는 실제 HTTP API와 동일한 계약의 메모리 mock을
환경 설정으로 전환할 수 있습니다.

## 내부 알파 실행

먼저 PostgreSQL을 실행하고, 초대 계정을 한 번만 bootstrap한 뒤 서버를 시작합니다. 아래 값은
로컬 개발 예시이며 실제 비밀번호는 저장소에 기록하지 않습니다.

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

계정이 생성되면 다음 실행부터 `BOOTSTRAP_ENABLED`를 제거합니다. 다른 터미널에서 Client를
실제 API 모드로 시작합니다.

```bash
cd apps/client
npm install
EXPO_PUBLIC_API_MODE=http \
EXPO_PUBLIC_API_URL=http://127.0.0.1:8080 \
npm run web
```

서버 검증은 `apps/server`에서 `./gradlew clean test`, Client 검증은 `apps/client`에서
`npm test`, `npm run lint`, `npm run typecheck`, `npm run test:build-env`, `npm run build:all`을 실행합니다. Docker 없이
UI만 확인하려면 Client의 API 환경 변수를 생략해 mock 모드로 실행할 수 있습니다.

EAS preview·production 환경에는 외부 HTTPS Backend 주소를 `EXPO_PUBLIC_API_URL`로 등록합니다.
EAS 프로젝트 연결과 Android·iOS Maestro 스모크 절차는 `apps/client/README.md`, 실제 기기
배포 게이트는 `docs/quality/mobile-release-checklist.md`에 정리되어 있습니다.

## 작업 순서

1. PO가 사용자 문제, MVP 범위와 인수 기준을 구체화합니다.
2. Product Designer가 핵심 흐름과 상태별 UX를 설계합니다.
3. Frontend가 실제 API 계약과 동일한 mock을 사용해 프로토타입을 구현합니다.
4. Backend가 검증된 흐름에 맞춰 도메인, API와 접근 제어를 구현합니다.
5. Reviewer가 제품 철학, 프라이버시, 접근성과 회귀 위험을 검토합니다.

## 주요 문서

- [제품 비전](docs/product/vision.md)
- [제품 원칙](docs/product/principles.md)
- [MVP 범위](docs/product/mvp.md)
- [내부 알파 범위와 인수 기준](docs/product/internal-alpha.md)
- [프라이버시 원칙](docs/product/privacy.md)
- [초기 UX 브리프](docs/design/experience-brief.md)
- [첫 프로토타입 디자인](docs/design/prototype-v1.md)
- [내부 알파 인증·공개 UX](docs/design/internal-alpha-auth.md)
- [첫 프로토타입 인수 기준](docs/product/prototype-v1-acceptance.md)
- [에이전트 운영 가이드](docs/agent-playbook.md)
- [기술 의사결정 원칙](docs/architecture/README.md)
- [Expo 유니버설 프로토타입 ADR](docs/architecture/decisions/0001-expo-universal-prototype.md)
- [제품 클라이언트와 Backend 기술 스택 ADR](docs/architecture/decisions/0002-client-and-backend-stack.md)
- [내부 알파 인증 ADR](docs/architecture/decisions/0003-internal-alpha-authentication.md)
