# 잇츠미 클라이언트

`지금의 나를 편집해 보는 작은 자기 잡지`라는 경험 가설을 검증하는 Expo SDK 57
유니버설 프로토타입입니다.

## 실행

```bash
npm install
npm run web
```

`npm run ios`와 `npm run android`로 네이티브 화면을 실행할 수 있습니다. 공식 Expo SDK 57의
최소 Node.js 버전은 22.13이므로 Node.js 22 이상 LTS를 사용합니다.

## 핵심 흐름

1. 시작 화면에서 질문 산책을 시작합니다.
2. 취향, 성격과 배우는 중인 것에 답하거나 건너뜁니다.
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

프로토타입 데이터는 의도적으로 메모리에만 존재하며 앱을 새로고침하면 초기화됩니다.

## 검증

```bash
npm test
npm run lint
npm run typecheck
npm run build:web
```
