# TRD — 기술 요구사항 정의서

## 1. 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 마크업 | HTML5 | 시맨틱 태그 사용 |
| 스타일 | CSS3 | CSS 변수·Flexbox·트랜지션 |
| 동작 | Vanilla JS (ES6+) | 프레임워크 없음 |
| 인증 | Supabase Auth | Google·GitHub OAuth implicit 플로우 + Email/Password |
| 데이터베이스 | Supabase Database (PostgreSQL) | RLS로 사용자 격리 |
| SDK | Supabase JS v2 | CDN 로드 (`@supabase/supabase-js@2`) |
| 드래그 앤 드롭 | HTML5 Drag and Drop API | 별도 라이브러리 없음 |
| 빌드 | 없음 | 정적 파일 직접 서빙 |

---

## 2. 파일 구조

```
kanban/
├── index.html      # 보드 골격 + 로그인 화면 (3 컬럼)
├── style.css       # 전체 스타일 (보드 + 로그인 화면)
├── config.js       # Supabase URL·anon key, 클라이언트 초기화
├── auth.js         # Auth 서비스 IIFE
├── app.js          # 상태 관리·렌더링·이벤트 (auth 게이트 포함)
├── OAUTH.md        # Supabase + Google + GitHub OAuth + Email 설정 가이드
├── PLAN.md
├── PRD.md
├── TRD.md
├── UserFlow.md
├── DatabaseDesign.md
├── Design.md
├── TASKS.md
├── CodingConvention.md
└── CLAUDE.md
```

---

## 3. 데이터 모델

### Supabase DB 스키마

```sql
-- Supabase Auth가 auth.users 테이블을 자동 관리

CREATE TABLE public.cards (
  id         TEXT PRIMARY KEY,                    -- uid() 생성값
  user_id    UUID NOT NULL
             REFERENCES auth.users(id)
             ON DELETE CASCADE,
  text       TEXT NOT NULL
             CHECK(length(text) BETWEEN 1 AND 2000),
  "column"   TEXT NOT NULL
             CHECK("column" IN ('todo','inprogress','done')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own cards" ON public.cards
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### JS 카드 객체 (런타임)

```js
{
  id:     string,                              // DB PRIMARY KEY
  text:   string,                              // 카드 본문
  column: 'todo' | 'inprogress' | 'done'
}
```

> `user_id`는 INSERT 시 `currentUser.id`에서 주입하고, SELECT 결과에서는 제외한다.  
> 런타임 `cards` 배열에는 포함하지 않는다.

---

## 4. 모듈 설계

### 4.1 config.js

```js
const SUPABASE_URL  = 'https://<project>.supabase.co';
const SUPABASE_KEY  = '<anon-key>';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'implicit' },
});
```

`config.js`는 `index.html`에서 Supabase CDN 다음, `auth.js`·`app.js` 이전에 로드한다.  
`flowType: 'implicit'` — GitHub Pages 등 SPA 환경에서 PKCE code 교환 없이 hash fragment로 토큰을 전달.

### 4.2 auth.js 함수 목록

| 함수 | 시그니처 | 역할 |
|---|---|---|
| `AuthKanban.signInWithGoogle` | `() → Promise<void>` | Google OAuth 리다이렉트 시작 |
| `AuthKanban.signInWithGitHub` | `() → Promise<void>` | GitHub OAuth 리다이렉트 시작 |
| `AuthKanban.signInWithEmail` | `(email, password) → Promise<boolean>` | 이메일/비밀번호 로그인. 성공 true, 실패 false |
| `AuthKanban.signUpWithEmail` | `(email, password) → Promise<boolean>` | 이메일/비밀번호 회원가입. 인증 메일 발송. 중복 이메일 안내 |
| `AuthKanban.signOut` | `() → Promise<void>` | 세션 삭제 후 `location.reload()` |
| `AuthKanban.onAuthStateChange` | `(callback) → Subscription` | 세션 변경 구독 |

`redirectTo`: `location.origin + location.pathname` (double-hash 버그 방지)

### 4.3 app.js 전역 변수

| 변수 | 타입 | 역할 |
|---|---|---|
| `cards` | `Card[]` | 단일 진실 공급원 — DB에서 로드, 뮤테이션 직후 갱신 |
| `dragId` | `string\|null` | DnD fallback (dataTransfer 유실 대비) |
| `boardInitialized` | `boolean` | 중복 `initBoard` 호출 방지 플래그 |
| `currentUser` | `User\|null` | 로그인 사용자 객체 (INSERT 시 `user_id` 주입에 사용) |

### 4.4 app.js 함수 목록

| 함수 | 시그니처 | 역할 |
|---|---|---|
| `uid` | `() → string` | 고유 ID 생성 |
| `loadCards` | `() → Promise<Card[]>` | Supabase SELECT (현 사용자 카드) |
| `addCard` | `(column, text) → Promise<void>` | Supabase INSERT (user_id 포함) → renderAll |
| `deleteCard` | `(id) → Promise<void>` | Supabase DELETE → renderAll |
| `moveCard` | `(id, targetColumn) → Promise<void>` | Supabase UPDATE column → renderAll |
| `renderAll` | `() → void` | 3 컬럼 전체 DOM 재구성 |
| `buildCard` | `(card) → HTMLElement` | 카드 DOM 생성 + 이벤트 바인딩 |
| `escapeHtml` | `(str) → string` | XSS 방지 문자 이스케이프 |
| `initDropZones` | `() → void` | `.cards` 드롭존 이벤트 등록 |
| `initAddButtons` | `() → void` | `+ 카드 추가` 버튼 이벤트 등록 |
| `showForm` | `(column, addBtn) → void` | 인라인 입력 폼. 빈 텍스트 → 폼 유지 |
| `showLoginScreen` | `() → void` | 로그인 화면 표시, 보드 숨김 |
| `initBoard` | `(user) → Promise<void>` | currentUser 저장, 카드 로드, 보드 표시 |

### 4.5 렌더링·상태 전략

- `cards` 배열이 **단일 진실 공급원** (DB에서 로드, 뮤테이션 직후 업데이트)
- 상태 변경: Supabase 호출 성공 → `cards` 배열 갱신 → `renderAll()`
- 화면 전환: `style.display = 'none'` / `''` 직접 제어 (`hidden` 속성 미사용)
  - CSS `display: flex`가 `hidden` 속성의 `display: none`을 덮어쓰는 문제 회피

---

## 5. 인증 흐름

### OAuth implicit 플로우

```
[1] 사용자가 "Google로 계속하기" 클릭
[2] auth.js → supabaseClient.auth.signInWithOAuth({ provider: 'google', redirectTo })
[3] 브라우저 → Google 로그인 페이지
[4] 인증 완료 → Google → Supabase callback URL
[5] Supabase → 앱의 redirectTo URL + #access_token=... (hash fragment)
[6] Supabase SDK가 hash에서 토큰 추출 → 세션 저장
[7] onAuthStateChange 발화 → SIGNED_IN 이벤트
[8] app.js → initBoard(user) 호출 → 로그인 화면 숨김, 보드 표시
```

### 이메일 회원가입 흐름

```
[1] 이메일·비밀번호 입력 → "회원가입" 버튼 클릭
[2] 버튼 disabled 처리 ("처리 중…")
[3] auth.js → supabaseClient.auth.signUp({ email, password })
[4a] 신규 이메일 → Supabase가 인증 이메일 발송 → "인증 이메일 발송" 안내
[4b] 이미 가입된 이메일 → 에러 → "이미 가입된 이메일" 안내
[5] 버튼 복원 (enabled)
[6] 사용자가 메일함에서 링크 클릭 → 이메일 인증 완료
[7] 이메일 로그인으로 보드 진입 가능
```

### 이메일 로그인 흐름

```
[1] 이메일·비밀번호 입력 → "로그인" 버튼 또는 Enter 키
[2] 버튼 disabled 처리 ("로그인 중…")
[3] auth.js → supabaseClient.auth.signInWithPassword({ email, password })
[4] 성공 → onAuthStateChange SIGNED_IN → initBoard
[4] 실패 → 에러 알림 → 버튼 복원
```

### 페이지 로드 시 세션 복원

```
index.html 로드
  → config.js: Supabase 클라이언트 초기화 (implicit flow)
  → auth.js: onAuthStateChange 구독
  → INITIAL_SESSION 이벤트:
      세션 있음 → initBoard(user)
      세션 없음 → showLoginScreen()
```

---

## 6. Drag & Drop 기술 명세

### 이벤트 흐름

```
dragstart (card)
  → dataTransfer.setData('text/plain', id)
  → card.classList.add('dragging')

dragover (zone)
  → e.preventDefault()
  → zone.classList.add('drag-over')

dragleave (zone)
  → zone.contains(e.relatedTarget) 체크 후
  → zone.classList.remove('drag-over')

drop (zone)
  → zone.classList.remove('drag-over')
  → id = dataTransfer.getData('text/plain') || dragId
  → moveCard(id, zone.dataset.column)    // async: Supabase UPDATE

dragend (card)
  → card.classList.remove('dragging')
  → dragId = null
```

> `dragleave`는 자식 요소 진입 시에도 발화하므로 `zone.contains(e.relatedTarget)` 체크 필수.

---

## 7. 보안

| 항목 | 처리 방법 |
|---|---|
| XSS | `escapeHtml()`로 `&`, `<`, `>`, `"` 이스케이프 후 `innerHTML` 삽입 |
| 인증 | Supabase Auth JWT. anon key는 공개 노출 안전 (RLS가 접근 제어) |
| 데이터 격리 | RLS Policy: `auth.uid() = user_id` — 타 사용자 카드 접근 불가 |
| 이메일 인증 | 회원가입 후 이메일 링크 클릭 전까지 로그인 불가 |
| 중복 클릭 방지 | 로그인/회원가입 버튼 disabled 처리로 중복 요청 차단 |

---

## 8. 브라우저 호환성

| API | 지원 여부 |
|---|---|
| HTML5 DnD API | Chrome 4+, Firefox 3.5+, Safari 3.1+, Edge 12+ ✅ |
| Supabase JS SDK v2 | 전체 현대 브라우저 (ES2018+) ✅ |
| CSS Flexbox | 전체 현대 브라우저 ✅ |
| CSS Custom Properties | Chrome 49+, Firefox 31+, Safari 9.1+ ✅ |

---

## 9. 실행 환경

```bash
# 정적 파일 서버 (OAuth redirect 시 localhost URL 필요)
python3 -m http.server 8765
# 접속: http://localhost:8765/index.html
```

> Supabase Dashboard → Authentication → URL Configuration에  
> `http://localhost:8765` 를 허용 URL로 등록해야 OAuth 리다이렉트가 동작한다.  
> 설정 절차: [OAUTH.md](./OAUTH.md) 참조.
