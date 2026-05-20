# OAUTH.md — Google·GitHub OAuth 설정 가이드

Supabase Auth를 통해 Google 및 GitHub 소셜 로그인을 설정하는 단계별 가이드.

---

## 전체 구조

```
Google Cloud Console     GitHub OAuth Apps
       ↓                        ↓
  Client ID/Secret         Client ID/Secret
       ↓                        ↓
  Supabase Auth Providers (Google / GitHub 활성화)
       ↓
  Supabase Auth Callback URL
  (https://<project>.supabase.co/auth/v1/callback)
       ↓
  앱 redirectTo URL
  (http://localhost:8765 또는 GitHub Pages URL)
```

---

## Step 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → 로그인 → **New Project**
2. 프로젝트 이름·비밀번호·리전 설정 후 생성
3. **Settings → API** 에서 다음 두 값을 복사해 `config.js`에 입력:
   - `Project URL` → `SUPABASE_URL`
   - `anon (public)` key → `SUPABASE_KEY`

```js
// config.js
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

---

## Step 2. Supabase Callback URL 확인

Supabase Dashboard → **Authentication → Providers** 상단에서 확인:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

이 URL을 Google Cloud Console 및 GitHub OAuth App에 등록한다.

---

## Step 3. Google OAuth 앱 등록

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. **+ CREATE CREDENTIALS → OAuth client ID**
3. Application type: **Web application**
4. **Authorized redirect URIs** 에 Supabase Callback URL 추가:
   ```
   https://<project>.supabase.co/auth/v1/callback
   ```
5. 생성 후 **Client ID** 와 **Client Secret** 복사

---

## Step 4. GitHub OAuth 앱 등록

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. 다음과 같이 입력:

   | 항목 | 값 |
   |---|---|
   | Application name | Kanban Board |
   | Homepage URL | `http://localhost:8765` (또는 배포 URL) |
   | Authorization callback URL | `https://<project>.supabase.co/auth/v1/callback` |

3. 등록 후 **Client ID** 복사, **Generate a new client secret** → **Client secret** 복사

---

## Step 5. Supabase에 Provider 등록

**Authentication → Providers** 에서 각각 활성화:

### Google

| 항목 | 값 |
|---|---|
| Enable Google provider | ✅ ON |
| Client ID (Google) | Step 3에서 복사한 값 |
| Client Secret (Google) | Step 3에서 복사한 값 |

### GitHub

| 항목 | 값 |
|---|---|
| Enable GitHub provider | ✅ ON |
| Client ID (GitHub) | Step 4에서 복사한 값 |
| Client Secret (GitHub) | Step 4에서 복사한 값 |

---

## Step 6. Redirect URL 허용 목록 등록

**Authentication → URL Configuration → Redirect URLs** 에 추가:

```
http://localhost:8765
http://localhost:8765/index.html
```

GitHub Pages 배포 시 추가:
```
https://<username>.github.io/<repo-name>/
https://<username>.github.io/<repo-name>/index.html
```

> **주의**: Site URL도 함께 설정 (ex: `http://localhost:8765`)

---

## Step 7. cards 테이블 및 RLS 설정

**SQL Editor** 에서 [DatabaseDesign.md](./DatabaseDesign.md)의 DDL을 실행:

```sql
CREATE TABLE public.cards (
  id         TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL CHECK(length(text) BETWEEN 1 AND 2000),
  "column"   TEXT NOT NULL CHECK("column" IN ('todo','inprogress','done')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own cards" ON public.cards
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Step 8. 로컬 실행 테스트

```bash
cd src/exercise/ksl3011/day03/kanban
python3 -m http.server 8765
# http://localhost:8765/index.html
```

체크:
- [ ] 로그인 화면이 표시됨
- [ ] "Google로 계속하기" 클릭 → Google 로그인 페이지 → 복귀 후 보드 표시
- [ ] "GitHub로 계속하기" 클릭 → GitHub 로그인 페이지 → 복귀 후 보드 표시
- [ ] 로그아웃 버튼 → 로그인 화면으로 복귀
- [ ] 카드 추가/삭제/이동 후 새로고침 → 유지 확인

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| OAuth 후 `localhost` 로 리다이렉트 안 됨 | Redirect URL 미등록 | Step 6에서 URL 추가 |
| `Invalid redirect_uri` 오류 | Google/GitHub callback URL 불일치 | Step 3·4 Callback URL 재확인 |
| 카드 CRUD 권한 오류 | RLS 미설정 또는 미인증 | Step 7 DDL 재실행, 로그인 상태 확인 |
| 새 탭/시크릿 창에서 로그인 풀림 | PKCE code verifier 유실 | Supabase SDK가 자동 처리 — `location.reload()` 로 해결 |
| `supabase is not defined` | CDN 로드 순서 오류 | `config.js` 이전에 CDN script 로드 확인 |
