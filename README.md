# 잇츠미 (It's Me)

다른 사람에게 보여주기 위한 SNS보다, 자신의 성격·취향·강점과 변화의 기록을 쌓는 데 초점을 둔 모바일 앱 프로토타입입니다.

## 현재 구현

- Expo와 React Native 기반 모바일 화면
- 기록 작성, 타임라인, 공개 프로필과 공유 화면
- 실제 서버와 같은 형태의 메모리 데이터 어댑터
- 제품 원칙, 프라이버시 기준, 사용자 흐름과 기술 선택을 기록한 문서
- 핵심 화면과 데이터 어댑터 테스트

백엔드는 아직 구현하지 않았습니다. 제품 흐름을 검증한 뒤 Kotlin/Spring Boot와 PostgreSQL 기반 서버를 연결할 계획입니다.

## 실행

```bash
cd apps/client
npm install
npm run web
```

검증 명령은 다음과 같습니다.

```bash
npm test
npm run lint
npm run typecheck
npm run build:web
```

## 문서

- [제품 비전](docs/product/vision.md)
- [MVP 범위](docs/product/mvp.md)
- [프라이버시 원칙](docs/product/privacy.md)
- [프로토타입 설계](docs/design/prototype-v1.md)
- [기술 선택 기록](docs/architecture/README.md)
