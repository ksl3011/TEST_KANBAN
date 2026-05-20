# TRD — 기술 요구사항 정의서

## 1. 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 마크업 | HTML5 | 시맨틱 태그 사용 |
| 스타일 | CSS3 | CSS 변수·Flexbox·트랜지션 |
| 동작 | Vanilla JS (ES6+) | 프레임워크·라이브러리 없음 |
| 영속성 | Web Storage API (localStorage) | 서버 없음 |
| 드래그 앤 드롭 | HTML5 Drag and Drop API | 별도 라이브러리 없음 |
| 빌드 | 없음 | 정적 파일 직접 서빙 |

---

## 2. 파일 구조

```
kanban/
├── index.html      # 보드 골격 (3 컬럼)
├── style.css       # 전체 스타일
├── app.js          # 상태 관리·렌더링·이벤트
├── PLAN.md
├── PRD.md
├── TRD.md
├── UserFlow.md
├── DatabaseDesign.md
├── Design.md
├── TASKS.md
└── CodingConvention.md
```

---

## 3. 데이터 모델

### 카드 객체

```js
{
  id:     string,   // uid() — Date.now().toString(36) + random suffix
  text:   string,   // 카드 본문 (trim 후 저장)
  column: 'todo' | 'inprogress' | 'done'
}
```

### localStorage 스키마

```
Key   : 'kanban-cards'
Value : JSON.stringify(Card[])
```

초기값이 없으면 샘플 카드 3개(각 컬럼 1개)를 기본값으로 사용한다.

---

## 4. 모듈 설계 (app.js)

### 4.1 상태

```
let cards: Card[]   // 단일 진실 공급원
let dragId: string  // 현재 드래그 중인 카드 ID
```

### 4.2 함수 목록

| 함수 | 시그니처 | 역할 |
|---|---|---|
| `uid` | `() → string` | 고유 ID 생성 |
| `loadFromStorage` | `() → Card[]` | localStorage 읽기, 실패 시 샘플 반환 |
| `save` | `() → void` | `cards` 배열을 localStorage에 직렬화 |
| `addCard` | `(column, text) → void` | 카드 추가 → save → renderAll |
| `deleteCard` | `(id) → void` | 카드 제거 → save → renderAll |
| `moveCard` | `(id, targetColumn) → void` | column 변경 → save → renderAll |
| `renderAll` | `() → void` | 3 컬럼 전체 DOM 재구성 |
| `buildCard` | `(card) → HTMLElement` | 카드 DOM 생성 + 이벤트 바인딩 |
| `escapeHtml` | `(str) → string` | XSS 방지 문자 이스케이프 |
| `initDropZones` | `() → void` | `.cards` 드롭존 이벤트 등록 |
| `initAddButtons` | `() → void` | `+ 카드 추가` 버튼 이벤트 등록 |
| `showForm` | `(column, addBtn) → void` | 인라인 입력 폼 표시·제거 |

### 4.3 렌더링 전략

- **전체 재렌더**: 카드 추가·삭제·이동 시 `renderAll()`을 호출해 3 컬럼 전체를 교체한다.
- 카드 100개 이하 기준으로 성능 문제 없음 (DOM 조작 최소화 최적화는 MVP 이후).

---

## 5. Drag & Drop 기술 명세

### 이벤트 흐름

```
dragstart (card)
  → dataTransfer.setData('text/plain', id)
  → card.classList.add('dragging')

dragover (zone)
  → e.preventDefault()          // drop 허용
  → zone.classList.add('drag-over')

dragleave (zone)
  → zone.classList.remove('drag-over')   // 자식 요소 경유 오탐 방지: relatedTarget 체크

drop (zone)
  → zone.classList.remove('drag-over')
  → id = dataTransfer.getData('text/plain') || dragId  // fallback
  → moveCard(id, zone.dataset.column)

dragend (card)
  → card.classList.remove('dragging')
  → dragId = null
```

### 주의 사항

- `dragleave`는 자식 요소로 이동할 때도 발생하므로 `e.relatedTarget`이 zone 내부인지 확인한다.
- `dataTransfer`가 일부 브라우저에서 드롭 이벤트 외부에서 비워질 수 있으므로 `dragId` 모듈 변수를 fallback으로 유지한다.

---

## 6. 보안

| 항목 | 처리 방법 |
|---|---|
| XSS | `escapeHtml()`로 `&`, `<`, `>`, `"` 이스케이프 후 `innerHTML` 삽입 |
| 저장 데이터 검증 | `loadFromStorage` 내 `try/catch`로 JSON 파싱 오류 처리 |

---

## 7. 브라우저 호환성

| API | 지원 여부 |
|---|---|
| HTML5 DnD API | Chrome 4+, Firefox 3.5+, Safari 3.1+, Edge 12+ ✅ |
| localStorage | 전체 현대 브라우저 ✅ |
| CSS Flexbox | 전체 현대 브라우저 ✅ |
| CSS Custom Properties | Chrome 49+, Firefox 31+, Safari 9.1+ ✅ |

---

## 8. 실행 환경

```bash
# 정적 파일 서버 (외부 자산이 상대 경로이므로 file:// 대신 사용)
python3 -m http.server 8765
# 접속: http://localhost:8765/index.html
```
