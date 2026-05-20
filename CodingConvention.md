# Coding Convention & Collaboration Guide

## 1. 파일 명명 규칙

| 대상 | 규칙 | 예시 |
|---|---|---|
| HTML | `kebab-case.html` | `index.html` |
| CSS | `kebab-case.css` | `style.css` |
| JS | `kebab-case.js` | `app.js` |
| 문서 | `UPPER_SNAKE.md` 또는 `PascalCase.md` | `PLAN.md`, `UserFlow.md` |

---

## 2. HTML 컨벤션

### 구조 원칙

- 시맨틱 태그 우선: `<header>`, `<main>`, `<section>`, `<button>` 등
- JS 훅은 `data-*` 속성 사용 — CSS 클래스와 역할 분리

```html
<!-- Good -->
<div class="cards" data-column="todo"></div>
<button class="add-btn" data-column="todo">+ 카드 추가</button>

<!-- Bad: JS 훅과 스타일 클래스를 섞음 -->
<div class="cards todo-drop-zone" id="js-todo-drop"></div>
```

- 인라인 `onclick`·인라인 `style` 금지 — 모든 이벤트는 JS에서, 스타일은 CSS에서

### 속성 순서

```
1. id
2. class
3. data-*
4. aria-*, role
5. 기타 (href, src, type, placeholder …)
```

---

## 3. CSS 컨벤션

### 네이밍

- BEM-inspired: `.block`, `.block__element`, `.block--modifier`
- 현재 프로젝트 스케일에서 엄격한 BEM 불필요 — 의미 있는 이름이면 충분

```css
/* Good */
.card { }
.card.dragging { }      /* modifier — 상태 클래스 */
.card-delete { }        /* element */

/* Bad */
.c { }
.div1 { }
```

### CSS 변수

- 값을 하드코딩하지 않고 `:root`에 선언한 변수 사용

```css
/* Good */
color: var(--col-todo);

/* Bad */
color: #6c8ebf;
```

### 선언 순서 (같은 선택자 내부)

```
1. display / position / layout (flex, grid)
2. box model (width, height, margin, padding)
3. border / border-radius
4. background / color
5. font / text
6. transition / animation
7. cursor / pointer-events
```

---

## 4. JavaScript 컨벤션

### 변수 · 함수 명명

| 종류 | 규칙 | 예시 |
|---|---|---|
| 변수 · 상수 | `camelCase` | `dragId`, `STORAGE_KEY` |
| 함수 | `camelCase` 동사로 시작 | `addCard()`, `renderAll()` |
| 상수 (변경 없음) | `UPPER_SNAKE_CASE` | `STORAGE_KEY` |

### 문법

- ES6+ 사용: `const` / `let` (var 금지), 화살표 함수, 템플릿 리터럴
- 세미콜론 필수
- 함수 선언: 최상위 로직은 `function` 선언식, 콜백은 화살표 함수

```js
// Good
function renderAll() { … }
cards.forEach(c => zone.appendChild(buildCard(c)));

// Bad
var renderAll = function() { … }
```

### 상태 관리 원칙

- `cards` 배열이 **단일 진실 공급원**
- 상태 변경 함수는 반드시 `save()` → `renderAll()` 순서로 호출

```js
function addCard(column, text) {
  cards.push({ id: uid(), text: text.trim(), column });
  save();        // 순서 1: 저장
  renderAll();   // 순서 2: 렌더링
}
```

### 보안

- 사용자 입력을 DOM에 삽입할 때 반드시 `escapeHtml()` 통과 후 `innerHTML` 사용
- `innerHTML`에 직접 사용자 문자열 금지

```js
// Good
el.querySelector('.card-text').innerHTML = escapeHtml(card.text);

// Bad
el.innerHTML = `<span>${card.text}</span>`;
```

### 주석 정책

- **주석은 WHY가 비자명할 때만** 작성. WHAT 설명 주석 금지.

```js
// Good: 이유가 비자명함
// dragleave는 자식 요소 진입 시에도 발생하므로 relatedTarget 확인
if (!zone.contains(e.relatedTarget)) { … }

// Bad: 코드가 이미 설명함
// 카드를 cards 배열에서 제거한다
cards = cards.filter(c => c.id !== id);
```

---

## 5. Git 협업 가이드

### 커밋 메시지

```
<타입>: <요약> (50자 이내)

[선택] 본문 — 왜 변경했는지 (not 무엇을)
```

| 타입 | 의미 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `style` | 스타일(CSS) 변경 |
| `refactor` | 로직 변경 없는 코드 구조 개선 |
| `docs` | 문서 작성·수정 |
| `chore` | 설정·기타 |

```bash
# 예시
feat: 카드 드래그 앤 드롭 컬럼 간 이동 구현
docs: PRD·TRD·UserFlow 문서 추가
fix: dragleave 오탐으로 drag-over 클래스 잔류 문제 수정
```

### 브랜치 · 머지 정책

- **항상 merge 커밋** — rebase 금지 (공유 저장소 정책)
- pull 시 `git pull --no-rebase origin main`
- 스테이징은 명시적 경로 사용

```bash
# Good
git add src/exercise/ksl3011/day03/kanban/app.js

# Bad
git add -A      # 이웃 참가자 파일이 섞일 수 있음
git add .
```

---

## 6. 코드 리뷰 체크리스트

- [ ] `escapeHtml()` 없이 `innerHTML`에 사용자 입력을 직접 삽입하지 않는가?
- [ ] 상태 변경 후 `save()` → `renderAll()` 순서를 지키는가?
- [ ] 인라인 이벤트 핸들러(`onclick=...`)를 사용하지 않는가?
- [ ] 하드코딩된 색상 대신 CSS 변수를 사용하는가?
- [ ] `var` 대신 `const`/`let`을 사용하는가?
- [ ] 불필요한 주석(WHAT 설명)이 없는가?
