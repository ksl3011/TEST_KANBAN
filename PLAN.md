# 칸반 보드 구현 계획

## 개요

To-Do / In-Progress / Done 3컬럼 칸반 보드.  
HTML · CSS · JS 파일을 각각 분리하여 구성한다.

---

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 보드 골격 (3 컬럼), CSS·JS 링크 |
| `style.css` | 레이아웃·카드·드래그 피드백 스타일 |
| `app.js` | 카드 추가/삭제, HTML5 Drag & Drop, localStorage 영속성 |

---

## index.html

```
<body>
  <header>칸반 보드</header>
  <main class="board">
    <section class="column" id="col-todo">
      <div class="column-header">To-Do  <span class="column-count"></span></div>
      <div class="cards" data-column="todo"></div>
      <button class="add-btn" data-column="todo">+ 카드 추가</button>
    </section>
    <section class="column" id="col-inprogress"> … </section>
    <section class="column" id="col-done"> … </section>
  </main>
</body>
```

- 각 컬럼: `<section class="column">` + 내부 `.cards` 드롭존 + 추가 버튼
- 인라인 스크립트 없음 — 모든 동작은 `app.js`에서

---

## style.css

- CSS 변수로 컬럼별 색상 정의 (`--col-todo`, `--col-progress`, `--col-done`)
- Flexbox로 3컬럼 수평 배치 (`flex: 1`, `min-width: 260px`)
- `.card` : 흰 배경, 둥근 테두리, 그림자, `cursor: grab`
- `.card.dragging` : 반투명(`opacity: 0.4`) + 회전 효과
- `.cards.drag-over` : 연한 파랑 배경 + 점선 테두리 (드롭 가능 힌트)
- 카드 추가 폼(textarea + 확인/취소 버튼) 스타일

---

## app.js

### 상태 모델

```js
// { id, text, column } 형태의 카드 배열
let cards = loadFromStorage();
```

### 주요 함수

| 함수 | 역할 |
|---|---|
| `renderAll()` | `cards` 배열 기반으로 3 컬럼 전부 다시 렌더링 |
| `addCard(column, text)` | 새 카드 생성 → push → `save()` → `renderAll()` |
| `deleteCard(id)` | 해당 id 제거 → `save()` → `renderAll()` |
| `moveCard(id, targetColumn)` | 카드의 `column` 필드 변경 → `save()` → `renderAll()` |
| `save()` | `localStorage.setItem('kanban-cards', JSON.stringify(cards))` |
| `loadFromStorage()` | localStorage 읽기, 없으면 샘플 카드 3개 반환 |
| `showForm(column, addBtn)` | 추가 폼 토글 (Enter 확인 / Esc 취소). 빈 텍스트 확인 시 폼 유지·포커스 복귀 |

### Drag & Drop 흐름

1. `dragstart` → `dataTransfer.setData('text/plain', id)` + `.dragging` 클래스
2. `dragend` → `.dragging` 클래스 제거
3. `.cards`에 `dragover` → `preventDefault()` + `.drag-over` 클래스
4. `dragleave` / `drop` → `.drag-over` 제거; `drop`에서 `moveCard()` 호출

---

## 실행 방법

```bash
cd src/exercise/ksl3011/day03/kanban
python3 -m http.server 8765
# 브라우저: http://localhost:8765/index.html
```

---

## 검증 체크리스트

- [ ] 3 컬럼이 나란히 표시됨
- [ ] 각 컬럼 헤더에 카드 수 배지 표시
- [ ] "+ 카드 추가" 버튼 → 폼 → 카드 생성
- [ ] 카드 드래그 → 다른 컬럼에 드롭 → 이동 확인
- [ ] 드래그 중 드롭존 강조 표시
- [ ] 카드 삭제 (×) 버튼 동작
- [ ] 페이지 새로고침 후 상태 유지 (localStorage)
