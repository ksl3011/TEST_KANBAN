# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

백엔드·빌드 도구·외부 라이브러리 **없는** 순수 HTML·CSS·JS 칸반 보드.  
To-Do / In-Progress / Done 3컬럼, 카드 드래그 앤 드롭, localStorage 영속성.

## 실행

```bash
python3 -m http.server 8765
# http://localhost:8765/index.html
```

`file://`로 직접 열지 않는다 — 상대 경로 자산 로드 실패.

---

## 아키텍처

### 파일 역할

| 파일 | 역할 |
|---|---|
| `index.html` | 보드 골격. JS 훅은 `data-column` 속성으로만 연결. 인라인 스크립트·이벤트 없음 |
| `style.css` | `:root` CSS 변수 기반 디자인 토큰. 하드코딩 색상값 없음 |
| `app.js` | 상태·렌더링·이벤트 전부. 프레임워크 없음 |

### app.js 데이터 흐름

```
cards[]  ←→  localStorage('kanban-cards')
   ↓
renderAll()  →  DOM 전체 재구성 (매 상태 변경 시)
```

- `cards` 배열이 **유일한 진실 공급원**. DOM에서 상태를 읽지 않는다.
- 상태 변경 함수는 반드시 `save()` → `renderAll()` 순서로 호출한다.

### 카드 객체 스키마

```js
{ id: string, text: string, column: 'todo' | 'inprogress' | 'done' }
```

### Drag & Drop 핵심 주의사항

- `dragleave`는 자식 요소 진입 시에도 발화한다 → `zone.contains(e.relatedTarget)` 체크 필수.
- `dataTransfer`가 drop 외부에서 비워질 수 있으므로 모듈 변수 `dragId`를 fallback으로 유지한다.

---

## 코딩 규칙 (핵심만)

> 상세 내용: [CodingConvention.md](./CodingConvention.md)

- **XSS**: 사용자 입력은 반드시 `escapeHtml()` 통과 후 `innerHTML` 삽입. 직접 삽입 금지.
- **JS 훅**: HTML에서 `data-*` 속성으로만. `id`를 JS 선택자로 쓰지 않는다.
- **CSS 변수**: 색상·그림자는 `var(--토큰명)` 사용. `:root` 외부에 하드코딩 금지.
- **`var` 금지**: `const`/`let`만 사용. 최상위 함수는 선언식(`function f(){}`), 콜백은 화살표.
- **외부 의존성 금지**: CDN 스크립트 포함 불가 (PRD 비기능 요구사항).

## Git

```bash
# 스테이징은 명시적 경로
git add src/exercise/ksl3011/day03/kanban/<파일>

# pull은 항상 no-rebase (공유 저장소 정책)
git pull --no-rebase origin main
```

커밋 타입: `feat` / `fix` / `style` / `refactor` / `docs` / `chore`

---

## 설계 문서 링크

| 문서 | 내용 |
|---|---|
| [PRD.md](./PRD.md) | 기능 요구사항, 범위 외 항목 |
| [TRD.md](./TRD.md) | 기술 스택, 함수 목록, DnD 이벤트 명세 |
| [UserFlow.md](./UserFlow.md) | 사용자 흐름도 (Mermaid) |
| [DatabaseDesign.md](./DatabaseDesign.md) | 데이터 모델 ERD, 향후 DB 전환 스키마 |
| [Design.md](./Design.md) | 컬러·타이포·간격·컴포넌트 명세 |
| [TASKS.md](./TASKS.md) | 완료된 작업 및 백로그 |
| [CodingConvention.md](./CodingConvention.md) | HTML·CSS·JS 상세 규칙, 코드 리뷰 체크리스트 |
