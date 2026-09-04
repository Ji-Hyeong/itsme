# 모바일 내부 알파 릴리스 체크리스트

## 자동 검증

- `npm ci`가 lockfile만으로 재현 가능하게 설치된다.
- EAS 환경 검증 테스트가 preview·production의 mock, 평문 HTTP, localhost와 사설 IP를 거절한다.
- TypeScript, Expo lint와 Jest 테스트가 통과한다.
- `expo export --platform all`이 Android, iOS와 Web 번들을 모두 생성한다.
- 수동 EAS Workflow가 같은 Maestro flow로 Android Emulator와 iOS Simulator의 로그인,
  비공개 기록 생성, 공개 미리보기와 최종 공개를 검증한다.

## 실기기 배포 게이트

아래 항목은 실제 센서나 기기 저장소와 운영체제 보조 기술이 필요하므로 App Store 또는
내부 배포 전에 Android와 iOS에서 각각 확인한다.

- 지원 하한인 Android 7 이상과 iOS 16.4 이상에서 새 설치와 재실행이 정상이다.
- Native bearer token이 일반 저장소나 로그가 아닌 SecureStore에만 남고 로그아웃 후 제거된다.
- 키보드가 이메일, 비밀번호와 자유 서술 입력을 가리지 않으며 완료·뒤로가기 후 포커스가 자연스럽다.
- TalkBack과 VoiceOver로 로그인, 질문 선택, 기록 저장, 공개 미리보기와 취소를 완료할 수 있다.
- 글자 크기 200%에서도 질문, 선택지, 위험 확인과 하단 탭의 정보·행동이 잘리지 않는다.
- 축소 모션 설정에서 전환이 과도하게 움직이지 않고 핵심 상태 변화는 텍스트로도 전달된다.
- 오프라인, API 오류, 세션 만료와 재로그인에서 작성 중 입력과 다른 계정의 개인 기록이 섞이지 않는다.
- 공개 화면에는 선택한 답변만 보이고 이메일, 내부 record ID, 맥락 원문과 다음 시도는 노출되지 않는다.

## 배포 기록

실기기 확인 시 기기 모델, OS 버전, build profile, commit SHA와 확인자를 PR에 남긴다.
실패 항목은 우회하지 않고 재현 절차와 개인정보 영향 여부를 함께 기록한다.
