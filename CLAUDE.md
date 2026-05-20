# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Google·GitHub·이메일 OAuth 로그인 + Supabase DB 기반 칸반 보드 (v2.1).  
To-Do / In-Progress / Done 3컬럼, 카드 드래그 앤 드롭, 기기 간 카드 동기화.

**배포 URL**: https://ksl3011.github.io/TEST_KANBAN

## 실행

```bash
python3 -m http.server 8765
# http://localhost:8765/index.html
```

`file://`로 직접 열지 않는다 — OAuth redirect URL이 `localhost`로 등록되어 있어야 하며, 상대 경로 자산 로드도 실패한다.

---

## 아키텍처

### 파일 역할

| 파일 | 역할 |
|---|---|
| `index.html` | 로그인 화면 + 보드 골격. JS 훅은 `id` 또는 `data-column` 속성으로 연결 |
| `style.css` | `:root` CSS 변수 기반 디자인 토큰. 로그인 화면·보드 스타일 포함 |
| `config.js` | Supabase URL·anon key, `supabaseClient` 초기화. **가장 먼저 로드** |
| `auth.js` | Auth 서비스 IIFE (`AuthKanban`). Google/GitHub 로그인·로그아웃·세션 구독 |
| `app.js` | 상태·렌더링·이벤트. auth 게이트(`onAuthStateChange`) 포함 |

### 로드 순서 (`index.html`)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/..."></script>
<script src="config.js"></script>   <!-- supabaseClient 초기화 -->
<script src="auth.js"></script>     <!-- AuthKanban IIFE -->
<script src="app.js"></script>      <!-- 보드 로직 + auth 게이트 -->
```

### 데이터 흐름

```
페이지 로드
  → onAuthStateChange (auth.js)
  → 세션 없음 → 로그인 화면
  → 세션 있음 → loadCards() [Supabase SELECT]
              → cards[] 초기화
              → renderAll() → DOM 구성

카드 뮤테이션
  → Supabase INSERT/UPDATE/DELETE
  → 성공 시 cards[] 갱신
  → renderAll()
```

- `cards` 배열이 **유일한 진실 공급원**. DOM에서 상태를 읽지 않는다.
- 뮤테이션 함수(`addCard`, `deleteCard`, `moveCard`)는 모두 `async`.
- `save()` 함수 없음 — localStorage 완전 제거.

### 카드 객체 스키마 (JS 런타임)

```js
{ id: string, text: string, column: 'todo' | 'inprogress' | 'done' }
```

`user_id`는 DB·RLS가 처리하므로 JS 객체에 포함하지 않는다.

### Drag & Drop 핵심 주의사항

- `dragleave`는 자식 요소 진입 시에도 발화한다 → `zone.contains(e.relatedTarget)` 체크 필수.
- `dataTransfer`가 drop 외부에서 비워질 수 있으므로 모듈 변수 `dragId`를 fallback으로 유지한다.

---

## 코딩 규칙 (핵심만)

> 상세 내용: [CodingConvention.md](./CodingConvention.md)

- **XSS**: 사용자 입력은 반드시 `escapeHtml()` 통과 후 `innerHTML` 삽입.
- **JS 훅**: HTML에서 `data-*` 속성 또는 `id`로만. 클래스 선택자로 비즈니스 로직 금지.
- **CSS 변수**: 색상·그림자는 `var(--토큰명)` 사용. `:root` 외부에 하드코딩 금지.
- **`var` 금지**: `const`/`let`만 사용.
- **외부 의존성**: Supabase JS SDK v2 CDN만 허용. 다른 외부 라이브러리 추가 금지.
- **async**: Supabase CRUD는 `async/await`. 오류는 `try/catch`로 처리 후 사용자에게 알림.

## Git

```bash
# 스테이징은 명시적 경로
git add src/exercise/ksl3011/day03/kanban/<파일>

# pull은 항상 no-rebase (공유 저장소 정책)
git pull --no-rebase origin main
```

커밋 타입: `feat` / `fix` / `style` / `refactor` / `docs` / `chore`

---

## Supabase 설정

> 초기 설정 절차: [OAUTH.md](./OAUTH.md)

- `config.js`에 Supabase URL·anon key 입력 (커밋 전 확인 — anon key는 공개 안전하나 URL은 노출 주의)
- Supabase Dashboard → Authentication → URL Configuration에 `http://localhost:8765` 등록 필수
- `cards` 테이블 DDL 및 RLS Policy는 [DatabaseDesign.md](./DatabaseDesign.md) 참조

---

## 설계 문서 링크

| 문서 | 내용 |
|---|---|
| [PRD.md](./PRD.md) | 기능 요구사항 (v2.0 인증 포함), 범위 외 항목 |
| [TRD.md](./TRD.md) | 기술 스택, 파일 역할, 함수 목록, 인증 흐름 |
| [UserFlow.md](./UserFlow.md) | OAuth 인증·보드 사용자 흐름도 (Mermaid) |
| [DatabaseDesign.md](./DatabaseDesign.md) | Supabase ERD, SQL DDL, CRUD API |
| [Design.md](./Design.md) | 컬러·타이포·간격·컴포넌트 명세 |
| [OAUTH.md](./OAUTH.md) | Supabase + Google + GitHub OAuth 설정 가이드 |
| [TASKS.md](./TASKS.md) | 완료된 작업 및 Phase 8 구현 체크리스트 |
| [CodingConvention.md](./CodingConvention.md) | HTML·CSS·JS 상세 규칙, 코드 리뷰 체크리스트 |
