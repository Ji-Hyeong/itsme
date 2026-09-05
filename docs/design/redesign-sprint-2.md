# 모바일 재설계 스프린트 2 — 문장 표지

## 문서 상태

- 작성·디자인 승인: Product Designer, 2026-08-04
- 구현 상태: Frontend handoff 가능, 실화면 미검수
- 현재 시각 판정: `redesign-sprint-1` 구현은 기능·개인정보 계약만 유지하고 시각 품질은 반려
- 상위 기준: `docs/product/vision.md`, `docs/product/principles.md`,
  `docs/product/mvp.md`, `docs/design/brand.md`, `docs/design/design-quality-gate.md`
- 적용 화면: 나, 질문, 변화, 공개 선택, 공개 확인, 공개 미리보기, 방문자 프로필, 기록 상세

이 문서는 스프린트 1의 기능·권한·오류·접근성 계약을 폐기하지 않는다. 레이아웃, 타입,
색, 형태, 공용 컴포넌트와 문구가 충돌하면 이 문서가 스프린트 2의 시각 구현 기준이다.
공개 정책과 제품 우선순위는 변경하지 않으며, 정책 변경이 필요한 항목은 PO 결정 전까지
구현하지 않는다.

## 한 문장 방향

> 프로필을 채우는 앱이 아니라, 내가 남긴 문장을 오늘의 표지처럼 펼쳐 읽는 앱.

방향 이름은 `문장 표지 / Living Folio`다. 사진이나 긴 글이 없어도 한 문장의 길이, 줄바꿈,
여백, 작은 범주 표식과 겹친 장면의 리듬만으로 개인의 분위기가 드러나는 편집형 모바일
경험을 만든다. `folio`는 완성된 작품집이 아니라 계속 끼우고 덜어내는 낱장의 묶음이다.

## 제품 원칙 잠금

다음은 시각 방향보다 우선하며 디자인 실험 대상으로 삼지 않는다.

- 좋아요, 팔로워·조회수, 순위, 궁합·성장 점수, 완성률과 경쟁형 연속 기록을 넣지 않는다.
- 새 기록은 항상 `나만 보기`로 시작한다. 공개는 현재 문장 확인 → 실제 공개 모습 미리보기 →
  최종 확정의 별도 행동이다.
- 비공개 기록, 과거 버전, 변화 이유, 다음 시도와 작성 맥락은 공개 renderer에 전달하지 않는다.
- 변화는 방향이나 성과로 판정하지 않는다. 상승 화살표, 긍정·부정색, 전후 점수를 쓰지 않는다.
- 모든 질문은 닫기, 건너뛰기, 나중에 답하기, 수정과 삭제가 가능하다.
- 사진, avatar와 긴 intro를 요구하지 않는다. 빈 intro는 자리표시나 결핍 문구로 대체하지 않는다.

## 스프린트 1 실화면 감사

### 감사 범위

`docs/design/evidence/redesign-sprint-1`의 Web 보조 증거 16장을 390×844와 430×932에서 직접
검토했다. 증거는 기능 흐름과 두 폭의 단일 열을 확인하는 자료로는 유효하지만 Native,
200% 확대, 로딩·오류·권한 상태의 공식 출고 증거는 아니다.

### 화면별 승인·반려표

| 증거 | 390×844 | 430×932 | 판정 | 근거 |
| --- | --- | --- | --- | --- |
| `home-empty` | 검토 | 검토 | 반려 Major | 280pt cover의 절반 이상이 무의미한 공백이고 `지금의 나`가 화면 제목·cover에서 반복된다. 정책 설명, 섹션 제목, 빈 카드가 모두 같은 강도로 이어져 개인보다 행정 안내가 먼저 읽힌다. |
| `home-record` | 검토 | 검토 | 반려 Major | 큰 흰 카드와 상단 색선만 반복된다. 답 `이끼 초록`의 개성보다 범주·날짜·공개 메타가 카드 틀 안에서 균등하게 나뉘며, 오늘의 질문도 또 하나의 카드라 화면 고유 리듬이 없다. |
| `question-choice` | 검토 | 검토 | 반려 Major | 설문형 radio 목록으로 보인다. 색 견본과 빈 원이 선택지 양 끝을 차지하고, 선택 전 비활성 CTA와 화면 중앙의 큰 공백이 사용자를 멈추게 한다. 질문과 답이 대화하지 않는다. |
| `question-600` | 검토 | 검토 | 반려 Major | 강한 이중 focus ring과 큰 textarea가 화면을 폼으로 만든다. 질문 맥락, 원문, 공개 기본값의 관계가 약하고 600자 상태에서 편집 호흡보다 입력 경계가 먼저 보인다. |
| `share-private-record` | 검토 | 검토 | 반려 Major | 단일 기록 뒤에 390에서는 약 280pt, 430에서는 약 360pt의 죽은 공간이 생긴다. 공개 결정이 문장을 읽는 행동이 아니라 하단 파란 버튼을 누르는 설정 화면처럼 보인다. |
| `share-confirm-dialog` | 검토 | 검토 | 조건부 승인 Minor | 배경 차단과 focus는 확인된다. 다만 회색 인용 상자, 동일 폭 버튼 2개와 뒤의 같은 CTA가 겹쳐 일반 시스템 dialog처럼 보이며 문장과 공개 결과가 한눈에 연결되지 않는다. |
| `preview-record` | 검토 | 검토 | 반려 Major | cover가 비어 있고 card·footer·CTA 사이 여백이 임의로 벌어진다. 미리보기 banner도 경고 strip처럼 보여 공개 전 ‘실제 프로필’에 몰입하기 어렵다. |
| `public-profile` | 검토 | 검토 | 반려 Major | `공개 프로필` 문구, cover, card, footer만 놓여 템플릿성이 강하다. Scene M은 하단 로고로만 등장하고 사용자의 문장으로 기억되는 고유한 표지 구조가 없다. |

`430`은 폭이 40pt 늘었지만 콘텐츠 밀도와 구조가 바뀌지 않아 빈 공간이 더 크게 보인다.
따라서 430 대응을 단순 width 확장으로 승인하지 않는다. 두 폭 모두 단일 열을 유지하되 cover의
자연 높이, 문장 line measure, 문장 간 리듬이 함께 달라져야 한다.

### 근본 원인

1. `최소 높이`를 `목표 높이`처럼 사용해 내용이 짧을수록 공백이 커졌다.
2. 모든 정보를 흰색 rounded card로 묶어 cover, 기록, 질문, 상태와 공개 결정이 같은 문법이 됐다.
3. 화면 제목과 설명을 먼저 쌓고 실제 사용자 문장을 뒤에 놓아 관공서식 정보 구조가 생겼다.
4. Pretendard Bold, 인디고 CTA와 얇은 회색 선만으로 위계를 만들어 브랜드가 로고 외에는 남지 않았다.
5. 범주색을 카드 상단 4pt 선으로 반복해 분류표처럼 보이고, 변화 가능성을 보여주는 ‘겹침’은
   화면 구조에 쓰이지 않았다.
6. 고정 bottom action이 콘텐츠와 무관하게 하단을 차지해 짧은 화면에서 거대한 공백을 만들었다.

## 레퍼런스 원리 기록

레퍼런스는 구조·밀도·타이포 위계와 상호작용 원리만 분석한다. 화면 구성, 색, 카피와 자산을
복제하지 않는다.

| 관찰 대상 | 취할 원리 | 잇츠미에서 제외할 것 |
| --- | --- | --- |
| 국내 취향 기반 프로필 서비스 | 관계를 맺기 전에 한 사람의 취향을 짧은 단서로 빠르게 읽게 한다. 잇츠미는 첫 viewport에서 이름·intro·대표 문장 1개를 읽게 한다. | 매너 점수, 인기·반응, 사진 중심 신뢰 장치, 모임 추천 |
| 국내 짧은 기록 서비스 | 제한된 한 문장과 하나의 질문이 시작 부담을 낮춘다. 질문 하나, 자유로운 건너뛰기와 작은 맥락 확장을 유지한다. | 출석, 연속 기록, 책 완성·성취 은유, 감정 자동 판정 |
| 한국어 모바일 에디토리얼 | 큰 한글 문장, 짧은 행 길이, 작은 캡션과 의도적인 비대칭이 콘텐츠의 목소리를 만든다. | 작가 등급, 구독·응원 수, 기사형 과도한 장문, 서비스 UI 복제 |

검토 출처는 문토 공식 Google Play 소개, 세줄일기 공식 소개, 네이버 마루부리 공식 글꼴
페이지다. 이는 기능이나 시각 요소의 사용 허가가 아니라 원리 확인 자료다.

- [문토 공식 Google Play 소개](https://play.google.com/store/apps/details?hl=ko&id=kr.munto.app)
- [세줄일기 공식 소개](https://threelinediary.blogspot.com/2020/09/blog-post.html)
- [네이버 마루부리 공식 글꼴 페이지](https://m-hangeul.naver.com/font/detail/maru-buri)

## 사용자 흐름과 화면 책임

| 화면 | 화면 목적 | 진입 | 성공 이탈 | 안전 이탈 |
| --- | --- | --- | --- | --- |
| 나 | 오늘의 이름·intro와 현재 문장을 한 편의 표지로 읽음 | 로그인 완료, 하단 `나` | 질문, 기록 상세, 공개 선택 | 계정, 앱 종료 |
| 질문 | 질문 한 문장에 잠시 머물고 답을 나만 보기로 남김 | 하단 `질문`, 나의 문장 여백 CTA | 저장 후 다음 질문 또는 나 | `닫기`, `지금은 넘길게요` |
| 변화 | 같은 주제의 당시 문장들을 판단 없이 겹쳐 읽음 | 하단 `변화` | 기록 상세 | 하단 다른 탭 |
| 공개 선택 | 방문자에게 보여줄 현재 문장만 고름 | 하단 `공개`, 상세의 공개 행동 | 공개 확인 | 변경 취소, 다른 탭 |
| 공개 확인 | 공개될 문장과 제외 정보를 확인함 | 비공개 항목의 `보여주기` | 공개 미리보기 | `그대로 나만 보기` |
| 공개 미리보기 | 방문자와 동일한 표지를 읽고 최종 확정함 | 공개 확인, 나의 보조 행동 | 최종 공개 | `선택으로 돌아가기` |
| 방문자 프로필 | 공개 허용된 문장만 안정적으로 읽음 | `/p/{slug}` | 브라우저 이탈 | 잘못된 주소·오류의 안전 이탈 |
| 기록 상세 | 현재 문장과 당시의 문장들을 읽고 새 버전을 남김 | 나의 문장, 변화 묶음 | 새 버전 저장, 공개 선택 | 뒤로가기, 편집 취소 |

하단 탭은 `나`, `질문`, `변화`, `공개` 순서를 유지한다. 공개 확인과 삭제는 modal이다.
기록 상세와 공개 미리보기는 작업 맥락을 보호하기 위해 탭을 숨긴다. 입력 중 이탈은
`이 문장을 두고 나갈까요?` dialog에서 `계속 쓰기`, `나가기`를 제공한다.

## 정보 우선순위

모든 화면은 다음 우선순위를 공유한다.

1. 사용자의 실제 문장 또는 사용자가 답할 질문
2. 문장을 이해하는 최소 맥락: 이름, 범주, 당시 시점
3. 다음 한 가지 행동
4. 공개 범위, 수정, 날짜와 시스템 안내
5. 브랜드 서명

화면 제목은 길 찾기 장치이며 hero가 아니다. `나`, `질문`, `변화`, `공개`의 18pt compact
label만 header에 사용하고, 페이지마다 28–32pt 큰 제목을 반복하지 않는다. 질문 문장과
사용자 문장만 큰 활자를 갖는다.

## 시각 언어

### 1. 활자 — UI와 목소리를 분리한다

- `Pretendard`: 내비게이션, 버튼, 메타, 설명, 입력 label. 현재 번들 Regular·Medium·SemiBold·Bold를 유지한다.
- `MaruBuri`: 질문 문장, 사용자 답변, 공개 profile name에만 사용한다. 공식 open license와
  license text를 함께 번들하고 Regular·SemiBold 두 weight만 로드한다.
- MaruBuri를 확보하지 못하면 임의의 시스템 serif로 대체하지 않는다. Pretendard로 먼저
  구현하고 디자인 QA를 `폰트 미완료 Major`로 남긴다.
- 사용자가 입력한 줄바꿈·문장부호를 보존한다. 앱이 따옴표, 말줄임표나 긍정 표현을 자동 추가하지 않는다.

| token | 크기/행간 | 굵기 | 용도 |
| --- | --- | --- | --- |
| `type.navTitle` | 18/26 | Pretendard 700 | compact 화면 제목 |
| `type.folioName` | 34/44 | MaruBuri 600 | 이름, 공개 표지 |
| `type.folioLead` | 30/43 | MaruBuri 600 | 첫 대표 문장, 질문 |
| `type.folioAnswer` | 24/36 | MaruBuri 600 | 일반 기록 답변 |
| `type.section` | 18/27 | Pretendard 700 | 섹션 제목 |
| `type.body` | 16/26 | Pretendard 400 | intro, 설명, 긴 입력 |
| `type.control` | 15/22 | Pretendard 600 | 버튼, 선택지 |
| `type.caption` | 13/20 | Pretendard 500 | 범주, 시점, 상태 |
| `type.micro` | 11/16 | Pretendard 600 | folio index, footer |

한글 display 자간은 `-0.015em` 이내, 본문은 0이다. 390에서 lead 한 줄의 목표 길이는 한글
11–15자, answer는 14–19자다. 강제 줄바꿈은 시스템 카피에만 허용하며 사용자 원문에는 쓰지 않는다.

### 2. 색 — 회색 행정 화면에서 잉크와 종이로

Scene M의 Sage·Indigo·Apricot 값과 순서는 바꾸지 않는다. 브랜드색을 큰 배경으로 칠하지
않고 여백 표식, 선택 상태와 문장 사이의 얇은 겹침에 사용한다.

| token | 값 | 역할 |
| --- | --- | --- |
| `color.canvas` | `#F6F3EC` | 따뜻한 종이 배경 |
| `color.paper` | `#FFFDF8` | 문장 sheet, modal, 입력 |
| `color.paperRaised` | `#FFFFFF` | focus·공개 확인 surface |
| `color.ink` | `#25231F` | 주요 문장과 제목 |
| `color.inkMuted` | `#68645C` | 설명과 날짜 |
| `color.rule` | `#918B81` | 의미 있는 1pt 구조선, Paper 대비 3.32:1 |
| `color.ruleSoft` | `#E6E0D5` | 장식용 hairline |
| `color.indigo` | `#4457A6` | 주요 행동, focus, 공개 선택 |
| `color.indigoDeep` | `#33427F` | 작은 강조 텍스트 |
| `color.indigoWash` | `#ECEEF8` | 선택된 option, preview 표식 |
| `color.sage` | `#718477` | 가치·도움 범주 여백 표식 |
| `color.sageWash` | `#EDF1EB` | 낮은 강조 면 |
| `color.apricot` | `#C87D5B` | 취향·시점 여백 표식 |
| `color.apricotWash` | `#F7ECE5` | 질문 보조 면 |
| `color.error` | `#A6322A` | 오류·삭제 |
| `color.errorWash` | `#F8E9E5` | 오류 면 |
| `color.scrim` | `rgba(37,35,31,0.58)` | modal 배경 |
| `color.focus` | `#1F4AB8` | 3pt 외곽 focus |

대비는 조합별 측정한다. 일반 글자 4.5:1, 큰 글자·아이콘·의미 있는 경계·focus 3:1을
통과하지 못하면 값이 표와 같아도 반려한다. `ruleSoft`에만 상태를 의존하지 않는다.

### 3. 질감 — 장식이 아니라 종이의 온도

- `FolioGrain`: 64×64px 단색 alpha PNG 한 장을 canvas에 3% opacity로 tile한다.
- 작은 글자, 입력 본문, skeleton, 공개 상태 control과 focus 아래에는 grain을 깔지 않는다.
- 고대비 모드, 데이터 절약, Web 200% 확대에서 제거해 가독성과 moiré를 우선한다.
- grain이 얼룩, gradient, 먼지나 사진 배경처럼 보이면 반려한다. 자산 미구현은 Minor이며
  구조와 타입이 승인된 뒤 추가한다.

### 4. 형태 — 카드 대신 낱장과 여백 표식

- 전체를 둥근 흰 카드로 감싸지 않는다. 사용자 문장은 canvas 위 `FolioSheet` 또는 경계 없는
  `FolioEntry`로 놓는다.
- radius는 sheet 20pt, control 12pt, input 14pt, modal 24pt다. 문장 entry는 기본 radius 0이다.
- 그림자는 쓰지 않는다. sheet는 `paper`와 1pt rule 중 하나, 또는 좌측 3pt register만 사용한다.
- 범주는 상단 색 막대 대신 `01 취향` 같은 folio index와 8×18pt 세로 register로 표시한다.
- register가 시간 순서, 점수나 진행률로 읽히지 않게 번호는 현재 목록 순서가 아니라 고정
  범주 코드다: `취향 01`, `성격 02`, `가치 03`, `강점 04`, `배우는 중 05`, `도움 06`.
  공개·비공개 여부에 따라 번호가 바뀌지 않는다.
- icon은 Material Community Icons outline 계열로 통일한다. 의미 없는 sparkle, trophy,
  chart, badge, person-circle을 쓰지 않는다. icon 20pt, stroke가 있는 자체 자산은 1.75pt 기준이다.

### 5. 겹침 — Scene M을 구조로 번역한다

Scene M 로고를 확대 반복하지 않는다. 대신 세 장면이 겹쳐 지금이 된다는 원리를 다음처럼 쓴다.

- 나 cover의 우측 상단에 24×64pt `SceneRegister` 세 장을 6pt씩 어긋나 겹친다. 실제 로고가
  아니므로 m 실루엣을 만들거나 로고처럼 읽히게 하지 않는다.
- 변화에서는 과거 sheet 2–3개의 상단 모서리가 6pt씩 보이되, 모든 문장은 실제 세로 흐름에서
  읽힌다. 겹침은 장식 preview일 뿐 콘텐츠를 가리거나 swipe를 요구하지 않는다.
- 공개 미리보기에서 `preview` frame과 공개 renderer를 8pt inset으로 분리해 ‘앱의 확인 UI’와
  ‘방문자의 실제 화면’을 명확히 구분한다.

## 레이아웃·반응형 계약

| viewport | gutter | 콘텐츠 폭 | 첫 viewport 목표 | 열 |
| --- | --- | --- | --- | --- |
| 390×844 | 20pt | 350pt | 이름·intro·대표 문장 1개 또는 질문+선택지 2개 | 1열 |
| 430×932 | 24pt | 382pt | 390과 같은 정보 + 다음 entry의 시작 24pt 이상 | 1열 |

- 430은 카드만 40pt 넓히지 않는다. gutter를 24pt로 늘리고 문장 line measure를 최대 382pt로
  제한해 활자의 호흡을 유지한다.
- header는 safe area 아래 높이 52pt다. 콘텐츠 시작은 header 아래 12pt, 마지막은 40pt다.
- Bottom tab은 64pt+safe area다. label과 icon을 모두 표시하고 활성 상태는 2pt 상단선,
  icon fill/outline 차이와 굵기 700 label을 함께 쓴다.
- 짧은 콘텐츠에서 CTA를 viewport 바닥에 억지로 붙이지 않는다. `content + 24pt + CTA`가
  하단 탭 위 공간에 들어가면 in-flow다. 스크롤이 필요한 화면만 sticky action을 쓴다.
- sticky action을 쓰면 content 뒤에 action 실제 높이+16pt padding을 둔다. sheet와 CTA 사이
  빈 공간이 120pt를 넘으면 in-flow로 전환한다.
- 태블릿 768pt 이상은 560pt 단일 folio column을 중앙에 둔다. 방문자 profile만 840pt에서
  360pt cover rail + 440pt entries의 2열을 허용한다. 순서는 cover → entries다.
- 데스크톱 1024pt 이상은 canvas만 확장하고 앱 조작 화면은 최대 560pt다. 모바일 프레임을
  기기 mockup처럼 둘러싸지 않는다.

### 200% 확대

`fontScale >= 1.5`부터 확대 레이아웃, 2.0에서 최종 검증한다.

- MaruBuri lead를 포함한 모든 활자는 플랫폼 확대를 그대로 적용하며 font scale이나
  effective size를 임의로 제한하지 않는다.
- 화면 제목과 action, entry의 범주·날짜·상태, 두 버튼을 모두 세로로 쌓는다.
- 줄 수 제한, fixed/min height와 max input height를 제거한다.
- BottomActionBar는 in-flow로 전환하고 modal body만 스크롤한다.
- register와 paper grain은 숨길 수 있지만 범주 text, 공개 icon+label과 focus는 유지한다.
- 가로 스크롤, 사용자 문장 말줄임, CTA 겹침과 접근 불가능한 counter가 있으면 Blocker다.

## 공용 컴포넌트 handoff

### `FolioHeader` — `ScreenHeader` 대체

- 52pt row: 선택적 back 44pt, compact title 18/26, trailing action 44pt.
- 큰 페이지 제목과 설명을 내부에 넣지 않는다. 화면의 lead content가 제목 역할을 한다.
- `fontScale >= 1.5`에서는 최소 높이만 유지하고 자연 높이로 늘어난다. action이 title 아래로 내려간다.
- 화면당 접근성 heading은 lead content 또는 screen title 중 하나만 지정한다.

### `FolioCover` — 고정 280pt cover 대체

- 정상: padding 24pt, 자연 높이 `min 176pt`, `max 없음`; 이름 → intro → 대표 공개 문장 순서.
- intro가 없으면 이름 아래 24pt 뒤 대표 문장으로 이어진다. 대표 문장도 없으면 152pt까지 줄어든다.
- 이름을 화면 제목과 반복하지 않는다. 소유자 화면 header는 `나`, cover는 실제 이름이다.
- `SceneRegister`는 장식으로 접근성 트리에서 제외한다.
- 공개 안내는 cover 밖 13/20 caption 한 줄로 둔다: `이름과 한 줄 소개는 공개 프로필에 보여요.`

### `FolioEntry` — `SceneCard` 대체

- 기본 구조: folio index+범주 → 답변 → 선택적 detail → 날짜·공개 상태.
- padding `20pt 0 24pt 20pt`, 좌측 3pt register, entry 사이 1pt ruleSoft.
- 사용자 답변은 MaruBuri 24/36, 범주·날짜·상태는 Pretendard 13/20이다.
- 100% 목록은 최대 5줄 후 `이 문장 이어 읽기`; 확대·스크린리더에서는 전체 문장을 표시한다.
- 소유자 entry 전체가 상세로 이동하되 공개 상태 control이 있는 공개 선택 화면에서는 entry와
  control을 별도 focus target으로 분리한다.
- 접근성 이름은 `범주, 답변, 마지막 변경일, 공개 상태`다. 시각 순서와 동일하다.

### `PromptSheet` — 질문 전용

- canvas 위에 border 없는 자연 높이 sheet. 상단 folio index, 질문 30/43, 안내 14/22.
- 선택지는 개별 큰 카드 대신 1pt rule로 나뉜 `ChoiceList` 한 묶음이다.
- option은 최소 64pt, 좌우 16pt. 선택 시 왼쪽 4pt register, check 20pt, `선택됨` text를 함께 쓴다.
- 색 질문의 swatch는 20pt 보조 표본이며 이름보다 먼저 읽히지 않는다. 빈 radio 원은 쓰지 않는다.
- 선택 전 primary action은 disabled button으로 상시 노출하지 않는다. option을 선택하면
  `나만 보기로 남기기`가 160ms opacity로 sheet 아래 나타난다. 스크린리더에는 layout 변경을 알린다.
- 자유 입력은 밑줄형이 아니라 paper input 1pt rule, min 176pt, padding 16pt다. focus는 3pt
  외곽 outline 하나만 쓰며 기본 border를 두껍게 하지 않는다.

### `VisibilityRow` — 공개 결정

- entry 아래 52pt row, 위 1pt rule. 왼쪽 icon+`나만 보기`/`공개`, 오른쪽 동사
  `보여주기`/`숨기기`를 둔다.
- 공개를 색으로만 전달하지 않는다. 잠금/눈 icon, 상태명, 동사를 모두 제공한다.
- 한 항목을 공개로 바꾸기 전 `ShareProofDialog`, 숨기기 전 `HideConfirmDialog`를 연다.

### `ShareProofDialog` — generic `BlockingDialog`의 공개 variant

- 제목 `이 문장을 보여줄까요?`
- 현재 문장을 MaruBuri 22/34의 인용 sheet로 표시한다. 회색 slab가 아니라 좌측 register와 paper를 쓴다.
- 설명 `지금 문장만 공개돼요. 이전 기록과 남긴 이유는 나만 볼 수 있어요.`
- 행동 순서: `그대로 나만 보기`, `공개 모습에서 확인하기`.
- 390에서 좌우 20pt, 430에서 24pt, max 382pt, padding 24pt, radius 24pt다.
- background inert, focus trap, 제목 focus, 취소·실패 후 trigger 복귀를 유지한다.

### `FolioAction`

- primary는 `ink` 배경 대신 Indigo `#4457A6`, 높이 54pt, radius 12pt, 너비 100%다.
- secondary는 surface button을 반복하지 않고 48pt text action 또는 1pt rule button을 쓴다.
- 한 viewport에 채워진 primary는 최대 한 개다. 탭 bar 바로 위에 같은 색 버튼이 중복되지 않는다.
- loading label은 행동을 유지한다: `남기는 중…`, `공개하는 중…`, `삭제하는 중…`.

### `FolioState`

- 빈 상태는 큰 흰 카드가 아니라 문장이 놓일 자리의 좌측 register와 24pt top/bottom padding으로 표현한다.
- loading은 최종 구조의 cover·entry·choice와 같은 정적 skeleton이다. shimmer와 임시 카피를 쓰지 않는다.
- error·permission은 paper surface를 허용하되 icon+제목+설명+한 행동 순서다.
- empty 문구에 `완성`, `채우기`, `부족`, `0개`를 쓰지 않는다.

## 화면별 승인 명세

### 1. 나

#### 정보 구조

1. `FolioHeader`: `나`, trailing `계정`
2. `FolioCover`: 실제 이름, 선택적 intro, 선택적 대표 문장 1개
3. 공개 caption
4. `요즘의 문장들`: 나머지 `FolioEntry`
5. 문장 사이에 끼워진 `오늘 머문 질문` 1개
6. text action `공개할 모습 살펴보기`

대표 문장은 첫 기록이나 공개 기록이 아니라 최근 수정한 현재 문장 1개다. 카테고리 우열을
만들지 않도록 사용자가 명시적으로 대표를 고르는 기능은 이번 범위에 넣지 않는다. 대표 문장은
목록에서도 사라지지 않고 cover 아래에 이어지는 첫 entry로 동일하게 접근 가능해야 한다.

정상 카피:

- 섹션: `요즘의 문장들`
- 안내: `새 문장은 먼저 나만 볼 수 있어요.`
- 질문 진입: `오늘은 이런 나를 만나볼까요?`
- 질문 예시: `요즘 자꾸 눈이 가는 색은 무엇인가요?`

빈 상태에서 cover는 이름과 intro만 자연 높이로 보인다. 아래에는 `아직 문장으로 정하지 않은
나도 그대로 괜찮아요.`와 `질문 하나 펼쳐보기`를 둔다. 여섯 범주 슬롯이나 cover 속 대체 문구는 없다.

로딩은 cover 160pt+entry 2개 skeleton, 초기 오류는 이름·intro까지 실패하면 전체 error,
기록만 실패하면 cover를 유지하고 목록 위치에 inline error를 둔다. 600자 답은 5줄 뒤
`이 문장 이어 읽기`, 200%에서는 전체 표시한다.

### 2. 질문

#### 정보 구조

1. `FolioHeader`: `질문`, trailing `닫기`
2. 범주 index `01 취향`
3. 질문 한 문장
4. 짧은 허용 문구 `한 문장만 남겨도 좋고, 오늘은 지나가도 괜찮아요.`
5. `ChoiceList` 또는 자유 입력
6. 선택 후 선택적 `조금 더 적어두고 싶다면`
7. in-flow primary `나만 보기로 남기기`
8. text action `지금은 넘길게요`

선택형은 리스트를 질문 바로 아래 20pt에 붙인다. 390/430에서 question+option 2개가 첫
viewport에 보여야 한다. 선택하지 않았을 때 저장 버튼이 disabled로 화면을 점유하지 않는다.
직접 쓰기 option을 선택하면 목록 아래 입력이 160ms opacity+6pt 이동으로 열린다.

자유 입력은 600자, 맥락 입력 1,200자다. counter는 `42 / 600`처럼 입력 오른쪽 아래에 둔다.
540자와 600자에서만 접근성 알림한다. 저장 실패는 원문과 keyboard 문맥을 유지하고 action
위에 `문장을 남기지 못했어요. 그대로 두었으니 다시 시도할 수 있어요.`를 표시한다.

### 3. 변화

#### 정보 구조

1. `FolioHeader`: `변화`
2. lead `같은 질문에, 다른 날의 내가 남긴 문장`
3. 설명 `달라진 뜻은 내가 정해요.`
4. 기록별 `LayeredHistory`

각 묶음은 범주·기록 제목 → 현재 문장 → `그때의 문장` 목록이다. 화살표 대신 날짜를 나란히
읽는다. 기본에서 date 76pt rail + body, `fontScale >= 1.5`에서는 column이다. 과거 sheet
모서리 겹침은 장식이며 전체 답은 세로 목록으로 읽힌다.

빈 상태: `아직 나란히 읽을 이전 문장은 없어요.` / `지금의 문장은 그대로 보관하고 있어요.` /
`현재 문장 읽기`. 로딩 2묶음 skeleton, 오류는 재시도, 1,200자 변화 이유는 목록 5줄+
`맥락 이어 읽기`, 상세·확대에서는 전체다.

### 4. 공개 선택

#### 정보 구조

1. `FolioHeader`: `공개`
2. lead `어떤 문장을 보여줄까요?`
3. policy note `이름과 한 줄 소개는 기본으로 보여요. 기록은 하나씩 선택할 수 있어요.`
4. `FolioEntry + VisibilityRow` 목록
5. 변경이 있을 때만 in-flow/sticky `공개 모습 확인하기`

공개·비공개 카드의 크기와 배경을 달리하지 않는다. 상태는 row에서만 표시한다. 공개로
바꾸면 dialog 뒤 미리보기로 가며 아직 확정하지 않는다. 공개 해제 dialog는 `이 문장을
숨길까요?`, `방문자 화면에서는 바로 사라지고 내 기록은 남아요.`, `계속 보여주기`,
`나만 보기로 바꾸기`다.

빈 상태: `아직 고를 문장이 없어요.` / `먼저 질문 하나를 펼쳐 지금의 나를 남겨보세요.` /
`질문 펼치기`. 항목 변경 실패는 해당 VisibilityRow 아래에만 표시하고 다른 항목을 되돌리지 않는다.

### 5. 공개 미리보기와 방문자 프로필

#### 미리보기 정보 구조

1. 앱 chrome의 `PreviewRibbon`: `공개 전 미리보기` + `다른 사람도 이 모습 그대로 봐요.`
2. 8pt inset 안의 실제 `PublicFolioRenderer`
3. `이대로 공개하기`
4. `선택으로 돌아가기`

`PreviewRibbon`은 상단 경고 banner가 아니라 Apricot 8×18 register와 두 줄 text다. renderer
안에는 미리보기, 편집, 공개 control이 없다. 미리보기와 방문자는 같은 데이터·component·순서·
빈 상태를 사용한다.

#### `PublicFolioRenderer`

1. 실제 이름 34/44
2. 선택적 intro 16/26
3. 공개한 현재 문장 `FolioEntry`
4. footer `Scene M + it’sME`, 접근성 이름은 `it'sME` 한 번

cover는 별도 280pt 빈 card가 아니다. 이름·intro가 있는 자연 높이 144–220pt folio cover다.
공개 문장이 있으면 첫 viewport에 이름·intro와 첫 문장 일부가 함께 보여야 한다. 공개 기록이
없으면 `공개한 문장은 아직 없어요.`만 표시하며 비공개 범주·수·자리표시를 만들지 않는다.

잘못된 slug는 `이 공개 프로필을 찾지 못했어요.`, 서버 오류는 `공개 프로필을 불러오지 못했어요.`로
분리한다. slug 변경 즉시 이전 사람의 모든 내용을 비우고 skeleton을 표시하며 늦은 응답은 버린다.

### 6. 기록 상세·편집·삭제

#### 정보 구조

1. `FolioHeader`: back `나로`, title `기록`
2. 범주 index+현재 문장
3. 공개 상태·마지막 변경일
4. 선택적 `이 문장을 남긴 이유`
5. `새 문장으로 남기기`, text action `공개 범위 보기`
6. `그때의 문장들`: 최신부터 날짜·답·변화 이유·다음 시도
7. `이 기록 삭제하기`

편집은 현재 답 600자, 이유 1,200자, 다음 시도 600자다. 저장은 과거 버전을 덮어쓰지 않는다.
공개 중인 기록을 수정하면 새 문장은 나만 보기로 돌아가며 `새 문장은 나만 보기로 남았어요.
공개 모습은 다시 확인할 수 있어요.`를 알린다.

삭제 dialog: 제목 `이 기록을 모두 지울까요?`, 대상 현재 문장, `현재 문장과 그때의 문장이
모두 영구 삭제돼요. 공개 중이면 방문자 화면에서도 바로 사라져요.`, `계속 보관하기`,
`영구 삭제하기`. 실패 시 dialog와 원문을 유지한다.

찾을 수 없음 `이 기록을 찾지 못했어요.`, 권한 없음 `이 기록을 볼 수 없어요.`를 분리하고
둘 다 민감 내용을 제거한 뒤 `나로 돌아가기`를 제공한다.

## 상태 매트릭스

| 상태 | 나 | 질문 | 변화 | 공개 선택 | 미리보기·방문자 | 상세 |
| --- | --- | --- | --- | --- | --- | --- |
| 정상 | cover+문장+질문 | prompt+입력 | 겹친 기록 묶음 | entry+상태 row | 동일 renderer | 현재+과거 |
| 빈 상태 | 문장 0, 질문 CTA | 답 미선택, 저장 CTA 없음 | 과거 0 | 기록 0 | 공개 기록 0 | 선택 맥락 0 |
| 로딩 | cover 160+entry 2 skeleton | 질문+option 구조 skeleton | group 2 skeleton | entry 3 skeleton | cover+entry skeleton | 현재+history 2 skeleton |
| 초기 오류 | 전체 또는 목록 error | 질문 error+재시도 | group error+재시도 | 목록 error+재시도 | not found/server 분리 | not found/permission 분리 |
| 갱신 오류 | 기존 문장 유지, inline | 원문 유지, action 인접 | 기존 group 유지 | 해당 row만 error | 선택·preview 유지 | 입력·dialog 유지 |
| 저장 중 | 해당 entry만 busy | label `남기는 중…` | N/A | label `바꾸는 중…` | `공개하는 중…` | `남기는 중…`/`삭제하는 중…` |
| 비공개 | icon+`나만 보기` | 저장 CTA에 명시 | 소유자만 표시 | `나만 보기`+`보여주기` | 응답·자리표시 모두 없음 | 상태+공개 범위 행동 |
| 긴 콘텐츠 | 5줄+이어 읽기 | 600/1,200자 보존 | 5줄+이어 읽기 | 5줄+이어 읽기 | 5줄+이어 읽기 | 전체 표시 |
| 200% | 전체 문장, in-flow | 전체 높이, keyboard 접근 | rail→column | 상태 row→column | 자연 높이 | 전체·modal scroll |

## 인터랙션과 모션

- 화면 진입: lead와 첫 문장을 함께 opacity 0→1, translateY 8→0, 180ms ease-out. 목록 stagger는 없다.
- 질문 선택: register 0→4pt, check+`선택됨` opacity, background 전환 140ms ease-out.
- 직접 쓰기: input opacity 0→1, translateY 6→0, 160ms. focus는 모션 후 이동한다.
- 새 문장 저장: 해당 entry의 paper tone만 220ms 밝아졌다 원래 값으로 돌아온다. 목록 spring은 없다.
- 공개 확인: dialog 180ms opacity+scale 0.985→1, preview renderer 180ms opacity. 공개 확정 전
  상태를 성공처럼 바꾸지 않는다.
- 변화 묶음: 사용자가 펼칠 때 한 번 180ms height+opacity. 자동 순차 재생, parallax와 swipe-only는 없다.
- skeleton은 정적이다. 무한 shimmer, pulse, 자동 스크롤과 배경 움직임을 쓰지 않는다.
- 축소 모션에서는 translate·scale·height animation을 제거하고 즉시 또는 100ms 이하 opacity만 쓴다.

## 접근성·프라이버시 요구사항

- 모든 control과 entry action은 최소 44×44pt, primary는 54pt, option은 64pt다.
- 화면당 heading 하나, 읽기 순서는 사용자 문장 → 맥락 → 행동 → 상태다.
- serif 사용 여부와 무관하게 본문 대비 4.5:1, 큰 글자·icon·focus·구조선 3:1을 측정한다.
- 색과 register를 제거해도 선택, 범주, 공개 상태, 오류, 현재 버전과 활성 탭을 text/icon으로 구분한다.
- focus는 3pt outline+2pt offset 하나만 사용하고 border 두께를 바꿔 layout을 움직이지 않는다.
- VoiceOver·TalkBack에서 `질문 저장`, `건너뛰기`, `편집 취소`, `삭제 취소`, `공개 취소`,
  `미리보기 뒤로`를 끝까지 완료한다.
- 200%에서 사용자 문장을 말줄임하지 않는다. sticky action은 in-flow이며 keyboard가 input,
  counter, error, 저장과 건너뛰기를 가리지 않는다.
- dialog는 modal semantics, background inert, focus trap, escape/Android back 취소, trigger focus 복귀를 제공한다.
- 공개 renderer의 접근성 tree와 API payload에는 비공개 범주명, 항목 수, 과거 버전, 맥락,
  이메일, 내부 ID와 소유자 control이 없어야 한다.
- 자유 서술 원문을 URL, 로그, 분석 이벤트와 screenshot filename에 넣지 않는다.

## Frontend 구현 순서

1. font asset·token·canvas·focus를 먼저 교체하고 `FolioHeader`, `FolioEntry`, `FolioAction`을 만든다.
2. `나`와 `PublicFolioRenderer`를 같은 문장 위계로 구현해 소유자/방문자 차이를 먼저 검증한다.
3. 질문의 `PromptSheet`와 `ChoiceList`, 공개의 `VisibilityRow`·`ShareProofDialog`를 구현한다.
4. 변화와 기록 상세를 `LayeredHistory`로 정렬한다.
5. 상태 fixture, 200%와 Native keyboard를 붙인 뒤 실화면 캡처를 제출한다.

`SceneCard`, 고정 280pt cover와 모든 상태를 감싸는 `StatePanel`을 한 번에 삭제하지 않는다.
새 primitive로 화면별 교체하고 테스트가 옮겨진 뒤 사용처가 0인지 확인한다. API, route와
domain model은 시각 변경 때문에 바꾸지 않는다.

## Frontend acceptance checklist

### 구조·브랜드

- [ ] 390은 20pt gutter/350pt, 430은 24pt gutter/382pt의 단일 열이다.
- [ ] 첫 viewport에서 나의 이름·intro·첫 문장 또는 질문+option 2개가 읽힌다.
- [ ] 고정 280pt 빈 cover, 반복되는 큰 화면 제목, 모든 내용을 감싼 rounded white card가 없다.
- [ ] MaruBuri는 사용자 문장·질문·공개 이름에만, Pretendard는 UI에 사용하며 license를 포함한다.
- [ ] `FolioHeader`, `FolioCover`, `FolioEntry`, `PromptSheet`, `VisibilityRow`,
  `ShareProofDialog`, `FolioAction`, `FolioState`를 공용으로 쓴다.
- [ ] Scene M은 공식 형태·색·순서를 유지하고 register를 로고처럼 변형하지 않는다.
- [ ] grain을 제거해도 구조가 온전하고 작은 글자·input·focus 아래에는 질감이 없다.

### 화면·콘텐츠

- [ ] 나 cover는 실제 이름을 한 번만 표시하고 자연 높이 152–220pt에서 콘텐츠에 맞게 늘어난다.
- [ ] 대표 문장은 최근 수정 문장일 뿐 우열·추천·공개 유도가 아니며 목록에서도 접근 가능하다.
- [ ] 질문 선택 전 disabled primary가 빈 화면을 점유하지 않고 option 선택 뒤 저장 행동이 나타난다.
- [ ] 공개 선택은 문장마다 icon+상태명+동사를 제공하고 dialog→동일 renderer 미리보기→확정 순서다.
- [ ] 미리보기와 방문자는 같은 응답·renderer·순서·빈 상태이며 소유자 control이 없다.
- [ ] 변화는 날짜와 문장을 보여주되 화살표, 상승·하락색, 평가 문구와 점수가 없다.
- [ ] 기록 수정은 과거 버전을 보존하고 공개 중 문장은 수정 후 나만 보기로 돌아간다.
- [ ] 좋아요, 팔로워, 조회수, 순위, 궁합·성장 점수, 완성률과 연속 기록이 없다.

### 상태·긴 콘텐츠

- [ ] 여섯 핵심 화면의 정상·빈·로딩·초기 오류·갱신 오류·비공개·긴 콘텐츠 fixture가 있다.
- [ ] 로딩 skeleton은 최종 cover, entry, choice와 같은 구조이며 shimmer가 없다.
- [ ] 빈 상태는 `0`, `완성`, `채우기`, 결핍 슬롯 없이 문장 한 개와 행동 한 개다.
- [ ] 600자 답, 1,200자 맥락, 긴 이름·intro·버전 3개가 저장·목록·상세에서 보존된다.
- [ ] 100% 목록은 5줄+명시적 이어 읽기, 200%·스크린리더·상세는 전체 문장이다.
- [ ] 삭제·공개 실패 후 원문, 선택, dialog와 trigger focus가 유지된다.

### 접근성·반응형

- [ ] 390×844와 430×932 각각의 100%·200% Native 실화면이 있다.
- [ ] 600자+200%+keyboard 동시 상태에서 counter, error, 저장과 건너뛰기를 조작한다.
- [ ] 모든 touch 44pt, primary 54pt, option 64pt이며 focus 3pt+2pt offset이다.
- [ ] 일반 글자 4.5:1, 큰 글자·icon·focus·의미 있는 경계 3:1을 측정한다.
- [ ] 색을 제거해도 선택·공개·오류·현재 상태가 text/icon으로 구분된다.
- [ ] 축소 모션에서 translate·scale·height·stagger가 없고 100ms 이하 opacity 또는 즉시다.
- [ ] 태블릿 조작 화면은 560pt 단일 열, 공개 profile만 840pt 이상에서 순서가 보존된 2열이다.

### 개인정보

- [ ] 새 문장은 나만 보기이고 공개 전에 현재 문장과 제외 정보를 보여준다.
- [ ] 공개 응답·화면·접근성 tree에 비공개 범주, 수, 과거, 맥락, 내부 ID와 계정 정보가 없다.
- [ ] slug 전환 즉시 이전 profile을 비우고 역순 응답이 현재 화면을 덮지 않는다.
- [ ] 자유 서술 원문이 URL, log, analytics와 증거 파일명에 없다.

## 필수 실화면 증거와 승인 기준

### 캡처 묶음

`design-quality-gate.md`의 전체 매트릭스를 유지하고 스프린트 2에서는 다음 비교판을 추가한다.

| 비교판 | 390×844 | 430×932 | 200% | 필수 확인 |
| --- | --- | --- | --- | --- |
| 나 정상·빈 | 필수 | 필수 | 필수 | 첫 viewport 밀도, 자연 cover 높이, 긴 문장 |
| 질문 선택·600자 | 필수 | 필수 | 필수+keyboard | 선택 전/후 CTA, counter, 건너뛰기 |
| 변화 정상·빈 | 필수 | 필수 | 필수 | 겹침 장식과 실제 읽기 순서 |
| 공개 선택·dialog | 필수 | 필수 | 필수 | 대상 문장, 제외 정보, focus trap |
| 미리보기·방문자 | 필수 | 필수 | 필수 | 동일 renderer, 비공개 부재 |
| 상세·삭제 | 필수 | 필수 | 필수 | 긴 버전, permission, 실패 보존 |

각 증거에는 commit SHA, platform, build, fontScale, reduced motion, fixture와 mock/API 여부를
기록한다. Web은 보조 증거이며 Native를 대체하지 않는다.

### 판정 등급

- `Blocker`: 비공개 노출, 공개 전 확정, 핵심 CTA 가림, 가로 overflow, 200% 핵심 문장 잘림,
  dialog focus 이탈, 이전 slug profile 노출.
- `Major`: 첫 viewport에서 사용자 문장 부재, 280pt 빈 cover 재발, 큰 제목·카드 반복,
  serif 미적용, 120pt 이상 무의미한 공백, 질문의 설문형 radio 회귀, 상태·긴 콘텐츠 캡처 누락.
- `Minor`: grain 미세 차이, 4pt 이내 비핵심 spacing, 장식 register의 광학 보정. 개인정보·대비·
  touch·읽기 순서는 Minor로 낮출 수 없다.

### 승인 규칙

- Blocker 0, Major 0일 때만 Product Designer가 화면별 승인한다.
- token, font, FolioEntry, PublicFolioRenderer, safe area 또는 navigation이 바뀌면 관련 승인은 만료된다.
- Frontend의 자체 검수는 Designer 승인과 Reviewer 독립 검토를 대체하지 않는다.
- 기능이 동작해도 현재 스프린트 1과 같은 빈 cover·반복 card·행정형 설명 구조가 남으면 반려한다.

## 현재 남은 시각적 부채

| 부채 | 심각도 | 해소 조건 | 책임 |
| --- | --- | --- | --- |
| MaruBuri 자산·license 미포함 | Major | 공식 Regular·SemiBold 번들, fallback·로딩·Native glyph 검증 | Frontend |
| 스프린트 2 Native 실화면 없음 | Blocker to release | 390/430, iOS/Android 핵심 교차, 100/200% 증거 | Frontend |
| 로딩·오류·권한 전체 증거 없음 | Major | 같은 commit 상태 매트릭스 제출 | Frontend |
| paper grain 실제 기기 moiré 미검증 | Minor | 1x/2x/3x 캡처와 고대비 off 검증 | Frontend·Designer |
| 태블릿 공개 profile 2열 미검증 | Minor MVP | 768/840/1024 폭에서 순서·line measure 확인 | Frontend |
| 스프린트 1의 이전 시각 승인 기록 | 문서 부채 | 본 문서의 반려 판정과 품질 게이트 기준을 연결 | Main·Designer |

## 디자인 승인 결론

`문장 표지 / Living Folio` 방향은 제품 철학, 공개 기본값, 변화 비판정과 접근성 계약을
유지하며 현재의 과도한 cover 공백, 반복 card, 큰 제목, 관공서식 설명과 약한 브랜드 기억점을
해결하는 구현 방향으로 승인한다. 이는 구현 완료 승인이 아니다. Frontend가 같은 commit의
상태별 Native 캡처를 제출하면 Product Designer가 390×844와 430×932를 직접 비교해 화면별
승인 또는 반려표를 새로 작성한다.
