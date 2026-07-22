# 잇츠미 (It's Me)

잇츠미는 남에게 자신을 증명하기 위한 SNS가 아니라, 사용자가 자신의 성격,
취향, 강점, 서툰 점과 변화의 흔적을 기록하며 스스로를 이해하도록 돕는 앱입니다.

## 현재 단계

Expo React Native 기반 모바일 전용 UX 프로토타입을 구현했습니다. 제품 대상은 Android와
iOS이며 Web 빌드는 모바일 화면을 빠르게 검증하는 미리보기로 사용합니다. 실제 Backend
대신 동일한 계약을 구현한 메모리 mock adapter를 사용합니다. 제품 Backend는 Kotlin·
Spring Boot, PostgreSQL·Flyway 기반 모듈형 모놀리스로 결정했습니다.

```bash
cd apps/client
npm install
npm run web
```

검증 명령은 `npm test`, `npm run lint`, `npm run typecheck`, `npm run build:web`입니다.

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
- [프라이버시 원칙](docs/product/privacy.md)
- [초기 UX 브리프](docs/design/experience-brief.md)
- [첫 프로토타입 디자인](docs/design/prototype-v1.md)
- [첫 프로토타입 인수 기준](docs/product/prototype-v1-acceptance.md)
- [에이전트 운영 가이드](docs/agent-playbook.md)
- [기술 의사결정 원칙](docs/architecture/README.md)
- [Expo 유니버설 프로토타입 ADR](docs/architecture/decisions/0001-expo-universal-prototype.md)
- [제품 클라이언트와 Backend 기술 스택 ADR](docs/architecture/decisions/0002-client-and-backend-stack.md)
