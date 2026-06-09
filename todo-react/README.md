## 과제 목표
이번 과제를 통해 무엇을 배우고자 했는지 간단하게 작성해요.

- Vanilla JS로 만든 Todo 앱을 React 컴포넌트 구조로 재구현하면서, 선언적 UI와 상태 기반 렌더링이 기존 DOM 직접 조작 방식과 어떻게 다른지 직접 비교해보고 싶었어요.
- `useState`, `useEffect`, `useMemo`, `useCallback` 등 React Hooks를 실제 기능에 적용하며 각 훅의 역할과 의존성 배열 관리 방법을 몸으로 익히고 싶었어요.
- 커스텀 훅(`useTodos`, `useDateNavigation`)으로 상태 로직과 UI 렌더링을 분리하는 관심사 분리(Separation of Concerns)를 경험하고 싶었어요.

---

## 과제 위치
- 브랜치명 : `week-02-조영우`
- 주요 파일 : `todo-react/src/App.jsx` / `src/hooks/useTodos.js` / `src/hooks/useDateNavigation.js`

---

## 구현한 기능
기본 미션 중 구현한 항목에 체크해요.

- [x] Todo CRUD 구현하기
- [x] 입력값 검증 및 안내 메시지 표시
- [x] 완료 토글 (취소선 표시 / 완료·취소 버튼 전환)
- [x] 상태 필터링 (전체 / 진행 중 / 완료)
- [x] LocalStorage 저장 및 불러오기 (새로고침 후에도 데이터 유지)

---

## 도전 기능
도전 미션 구현을 시도했다면 구현 항목에 체크해요.

- [x] 날짜별 Todo 관리 (주간 네비게이션으로 날짜 선택, 선택한 날짜의 Todo만 표시)
- [x] 월 네비게이션 (이전·다음 달 이동, 월말 날짜 자동 보정)
- [x] 날짜 셀에 Todo 개수 뱃지 표시
- [x] 삭제 확인 UX (삭제 버튼 클릭 시 "정말 삭제할까요?" 확인 단계 추가)
- [x] 수정 중 Enter 저장 / Escape 취소 키보드 처리
- [x] 한글 IME 이중 제출 방지 (`isComposing` 처리)

---

## AI 활용 내역
AI를 활용해 구현하거나 수정한 내용을 기록해요.
단순히 어떤 프롬프트를 썼는지보다, 어떤 결과를 받았고 어떻게 수정했는지를 중심으로 작성해요.

### React 컴포넌트 구조 설계 + 기본 CRUD 구현
- AI 활용 내용 :
week-01 Vanilla JS Todo 앱을 React로 변환하는 전체 컴포넌트 구조를 함께 설계했어요. 어떤 단위로 컴포넌트를 나눌지, 상태를 어디서 관리할지부터 논의하며 `MonthNav`, `WeekNav`, `WeekDayCell`, `TodoInput`, `FilterTabs`, `TodoList`, `TodoItem` 7개 컴포넌트로 분리된 초기 구조와 Tailwind CSS v4 `@theme` 디자인 토큰 기반 색상 시스템을 받았어요.
- 직접 수정한 부분 : 삭제 버튼 클릭 시 바로 삭제되는 AI 초안에 "정말 삭제할까요?" 확인 단계를 추가하도록 `TodoItem` UX 흐름을 직접 요청해서 반영했어요. 수정 모드 진입 시 `showDeleteConfirm` 상태를 초기화하는 부분도 이 과정에서 함께 챙겼어요.
- 수정 이유 : 실수로 클릭했을 때 바로 삭제되면 되돌릴 수 없어서, 확인 단계를 두는 게 실제 사용성에 더 적합하다고 판단했어요.

### 커스텀 훅 분리 (useTodos, useDateNavigation)
- AI 활용 내용 :
초기 구현에서 `App.jsx`에 상태와 핸들러가 모두 몰려 있어 코드가 길어지는 문제를 발견하고 관심사 분리 리팩터링을 요청했어요. Todo CRUD + localStorage 동기화는 `useTodos`, 날짜·주간 이동 로직은 `useDateNavigation`으로 분리된 커스텀 훅을 받았어요. `useEffect([todos])` 패턴으로 하나의 저장 통로를 만드는 방식과 `localStorage.getItem` 파싱 실패 시 빈 배열을 반환하는 예외 처리도 이 시점에 적용했어요.
- 직접 수정한 부분 : `useDateNavigation`의 `changeMonth` 함수 내 월말 날짜 보정 로직이 week-01에서 직접 구현했던 방식과 동일한지 검토하고 확인했어요.
- 수정 이유 : week-01에서 `setMonth` 자동 오버플로 버그를 직접 겪었기 때문에, React 버전에서도 동일하게 처리되는지 꼼꼼히 검증하고 싶었어요.

### React.memo + useCallback 최적화
- AI 활용 내용 :
`WeekNav`에 `React.memo`를 적용했는데 효과가 없는 이유를 물어봤어요. `onSelectDate` prop으로 인라인 함수를 전달하면 매 렌더링마다 새 참조가 생겨 memo가 무효화된다는 것과, `useCallback` + 함수형 업데이터 패턴(`setSelectedDate((prev) => ...)`)으로 deps를 비운 채 안정적인 함수 참조를 만드는 방법을 설명받았어요. `WeekDayCell`에도 `memo`를 적용하기 위해 `dateKey` prop을 분리하고 `onSelect={setSelectedDate}`를 안정적으로 전달하는 구조도 함께 설계받았어요.
- 직접 수정한 부분 : `useTodos` CRUD 함수(`addTodo`, `toggleTodo`, `updateTodo`, `deleteTodo`)도 `todos`를 클로저로 캡처해서 매 상태 변경마다 재생성된다는 문제를 발견하고, 동일한 함수형 업데이터 패턴으로 수정하도록 추가 요청했어요.
- 수정 이유 : `addTodo` 같은 CRUD 함수가 매번 새로 생성되면 이후 컴포넌트 메모이제이션 효과가 없어지기 때문이에요.

### 코드 품질 개선 (PropTypes, 인라인 핸들러 추출)
- AI 활용 내용 :
`App.jsx`의 인라인 핸들러(`() => changeMonth(-1)`, `(text) => addTodo(text, selectedDate)`) 제거, `TodoInput`·`TodoItem`의 `onKeyDown` 인라인 핸들러 명명된 함수로 추출, `prop-types` 패키지 설치 및 전체 컴포넌트 PropTypes 정의를 일괄 요청했어요.
- 직접 수정한 부분 : PropTypes 정의에서 `FilterTabs`와 `TodoList`의 `currentFilter`를 `PropTypes.string` 대신 `PropTypes.oneOf(['all', 'active', 'completed'])`로 허용값을 명시해야 한다는 점을 검토하고 반영하도록 요청했어요.
- 수정 이유 : 허용 가능한 값의 범위를 PropTypes 레벨에서 명시해두면 잘못된 값이 전달됐을 때 더 명확한 경고를 받을 수 있기 때문이에요.

---

## 구현하면서 고민한 점
구현 과정에서 막혔던 부분이나 고민했던 내용, 해결 방법을 자유롭게 작성해요.

- 고민한 점 : 날짜 상태를 `Date` 객체로 관리하자 주간 이동 후 날짜가 하루씩 밀리는 버그가 생겼어요. `new Date("2026-06-09")` 처럼 문자열로 생성하면 UTC 자정으로 파싱되는데, 한국은 UTC+9라서 로컬 시간으로 변환할 때 전날 날짜가 되는 문제였어요.
- 해결 방법 : 상태를 `"YYYY-MM-DD"` 문자열로 관리하고, Date 객체가 필요한 곳에서만 `parseDate(str)` 함수(`new Date(y, m-1, d)` 로컬 시간 파싱)로 변환하도록 구조를 바꿨어요. 문자열로 관리하니 날짜 비교도 `===` 동등 비교로 처리할 수 있어서 오히려 더 단순해졌어요.

---

## 과제 회고
과제를 마치고 느낀 점, 아쉬운 점, 다음에 개선하고 싶은 점을 자유롭게 작성해요.

- 잘한 점 : `React.memo`가 "props가 바뀌지 않으면 re-render를 건너뜀"이라는 것은 알았지만, 인라인 함수를 props로 전달하면 매 렌더링마다 새 참조가 생겨 memo가 무효화된다는 점을 이번에 코드로 직접 확인하며 이해했어요. 개념을 아는 것과 왜 그렇게 동작하는지 이해하는 것은 다르다는 걸 느꼈어요.
- 아쉬운 점 : 처음부터 TypeScript로 시작했다면 `prop-types` 보일러플레이트 없이 타입 안전성을 챙길 수 있었을 것 같아요. 이번에 `prop-types`를 사용하면서 런타임 경고만 제공하고 IDE 자동완성이 없다는 한계를 직접 체감했어요.
- 다음에 시도해볼 것 : TypeScript로 처음부터 프로젝트를 시작하는 경험을 해보고 싶어요. 상태가 더 복잡해지면 `useState`만으로는 한계가 생길 것 같아서, Context API나 Zustand 같은 상태 관리 방법도 직접 써보고 싶어요.
