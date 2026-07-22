# 잇츠미 클라이언트

`지금의 나를 편집해 보는 작은 자기 잡지`라는 경험 가설을 검증하는 Expo SDK 57
내부 알파 클라이언트입니다. 초대 계정 로그인과 실제 HTTP API를 지원하며 자가 가입은 제공하지 않습니다.

## 실행

```bash
npm install
npm run web
```

실제 내부 알파 API를 연결할 때는 `.env.example`을 참고해 로컬 `.env.local` 또는 EAS 환경에
`EXPO_PUBLIC_API_MODE=http`, `EXPO_PUBLIC_API_URL=https://...`를 설정합니다. `mock` adapter는
개발·테스트 또는 `EXPO_PUBLIC_BUILD_PROFILE=local`로 명시한 로컬 빌드에서만 허용됩니다.
EAS preview·production은 HTTPS API URL이 없으면 빌드를 중단합니다. `EXPO_PUBLIC_` 값은 앱 번들에 포함되므로 토큰,
비밀번호와 비밀키는 절대 넣지 않습니다. Web 토큰은 브라우저 세션까지만, Native 토큰은
`expo-secure-store`에 보관합니다.

`npm run ios`와 `npm run android`로 네이티브 화면을 실행할 수 있습니다. 공식 Expo SDK 57의
최소 Node.js 버전은 22.13이므로 Node.js 22 이상 LTS를 사용합니다.

## 핵심 흐름

1. 운영자가 발급한 초대 계정으로 로그인합니다.
2. 시작 화면에서 질문 산책을 열고 취향, 성격과 배우는 중인 것에 답하거나 건너뜁니다.
3. 모든 새 기록은 `나만 보기`로 현재의 나에 반영됩니다.
4. 기록을 새 버전으로 남기면 이전 답과 변화 맥락이 보존됩니다.
5. 공개할 항목을 하나씩 확인하고 실제 방문자 화면과 같은 모습으로 미리 봅니다.

## 구조

- `src/app`: Expo Router 화면
- `src/domain`: Zod 계약과 제품 모델
- `src/data`: API port와 계약 기반 mock adapter
- `src/state`: 화면과 adapter 사이의 상태 경계
- `src/features`: 자기 초상과 공개 프로필 패턴
- `src/ui`: 디자인 토큰과 접근 가능한 UI primitive

`mock` 모드의 데이터는 메모리에만 존재하며 새로고침하면 초기화됩니다. `http` 모드에서는
OpenAPI 계약의 서버에 영구 저장되고, 공개 프로필은 인증 없이 별도 공개 endpoint에서 조회합니다.
Web의 임의 공개 slug 직접 진입을 위해 SPA(`web.output: single`)로 export하므로 배포 호스트는
모든 앱 경로를 `index.html`로 rewrite해야 합니다. 내부 알파 동안에는 문서 meta와
`public/robots.txt`가 검색 색인을 차단하며, 배포 서버도 `X-Robots-Tag`를 유지해야 합니다.

## 검증

```bash
npm test
npm run lint
npm run typecheck
npm run generate:api
npm run build:web
```

`contracts/openapi/itsme.yaml`을 바꾸면 `npm run generate:api`로 생성 타입을 갱신하고 함께
커밋합니다. CI는 계약과 생성 타입이 다르면 실패합니다.
