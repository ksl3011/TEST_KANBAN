# TASKS — 작업 목록

## Phase 1: 프로젝트 초기 설정

- [x] 디렉터리 생성 (`day03/kanban/`)
- [x] `index.html` 기본 구조 작성
- [x] `style.css` 파일 생성
- [x] `app.js` 파일 생성

## Phase 2: HTML 구조

- [x] 3 컬럼 레이아웃 (`todo`, `inprogress`, `done`)
- [x] 컬럼 헤더 (타이틀 + 카드 수 배지)
- [x] 카드 드롭존 (`.cards[data-column]`)
- [x] "+ 카드 추가" 버튼

## Phase 3: CSS 스타일링

- [x] CSS 변수 정의 (컬러·그림자·간격)
- [x] Flexbox 3컬럼 레이아웃
- [x] 카드 스타일 (기본 · 호버 · 드래그 중)
- [x] 드롭존 강조 스타일 (`.drag-over`)
- [x] 카드 추가 폼 스타일 (textarea · 버튼)
- [x] 앱 헤더 스타일

## Phase 4: JavaScript 로직

- [x] 상태 모델 (`cards` 배열)
- [x] `uid()` — 고유 ID 생성
- [x] `addCard()` — 카드 추가
- [x] `deleteCard()` — 카드 삭제
- [x] `moveCard()` — 컬럼 간 이동
- [x] `renderAll()` — 전체 DOM 재구성
- [x] `buildCard()` — 카드 DOM 생성 + 이벤트
- [x] `escapeHtml()` — XSS 방지
- [x] `initDropZones()` — 드롭존 이벤트 등록
- [x] `initAddButtons()` — 추가 버튼 이벤트 등록
- [x] `showForm()` — 인라인 입력 폼 (Enter · Esc)

## Phase 5: 문서화

- [x] `PLAN.md` — 구현 계획서
- [x] `PRD.md` — 제품 요구사항 정의서
- [x] `TRD.md` — 기술 요구사항 정의서
- [x] `UserFlow.md` — 사용자 흐름도 (Mermaid)
- [x] `DatabaseDesign.md` — 데이터베이스 설계 (Mermaid ERD)
- [x] `Design.md` — 기초 디자인 시스템
- [x] `TASKS.md` — 작업 목록 (이 파일)
- [x] `CodingConvention.md` — 코딩 컨벤션 & 협업 가이드
- [x] `CLAUDE.md` — Claude Code 작업 가이드

## Phase 6: 검증 (코드 검토 완료 2026-05-20)

- [x] 3 컬럼 렌더링 확인
- [x] 카드 추가 (Enter · 확인 버튼) 동작 확인
- [x] 카드 추가 취소 (Esc · 취소 버튼) 동작 확인
- [x] 카드 삭제 (×) 동작 확인
- [x] 드래그 앤 드롭 컬럼 간 이동 확인
- [x] 드롭존 시각 피드백 확인
- [x] 빈 텍스트 카드 추가 방지 확인

## Phase 8: OAuth + Supabase 연동 (v2.0)

### 설계·문서화
- [x] 아키텍처 결정 (Supabase Auth + DB)
- [x] `PRD.md` v2.0 갱신 (F-06~F-09 인증 기능 추가)
- [x] `TRD.md` v2.0 갱신 (Supabase 스택, config.js·auth.js 명세)
- [x] `DatabaseDesign.md` 갱신 (ERD auth.users 추가, SQL DDL)
- [x] `UserFlow.md` 갱신 (OAuth 인증 흐름 다이어그램 추가)
- [x] `OAUTH.md` 신규 생성 (설정 단계별 가이드)

### 구현
- [x] `config.js` — Supabase 클라이언트 초기화 (implicit flow)
- [x] `auth.js` — signInWithGoogle/GitHub, signOut, onAuthStateChange
- [x] `index.html` — Supabase CDN, 로그인 화면 UI, 헤더 사용자정보·로그아웃 버튼
- [x] `style.css` — 로그인 화면·로그아웃 버튼·헤더 user-info 스타일
- [x] `app.js` — auth 게이트(boardInitialized 플래그), Supabase CRUD (async), localStorage 완전 제거

### 버그 수정
- [x] `style.css` — `[hidden] { display: none !important }` 추가 (CSS specificity 문제)
- [x] `app.js` — 화면 전환을 `style.display` 직접 제어로 변경 (hidden 속성 미사용)
- [x] `app.js` — `addCard`에 `user_id: currentUser.id` 포함 (RLS 정책 통과)
- [x] `app.js` — `currentUser` 전역 변수로 로그인 사용자 보관

### 검증
- [x] 페이지 로드 시 로그인 화면 표시 확인
- [x] Google OAuth 로그인 → 보드 표시 확인
- [x] 로그아웃 → 로그인 화면 복귀 확인
- [x] 카드 CRUD가 Supabase에 저장됨 (새로고침 후 유지)
- [ ] GitHub OAuth 로그인 → 보드 표시 확인
- [ ] 다른 브라우저/기기에서 같은 계정 로그인 시 카드 동기화
- [ ] 미인증 상태에서 보드 직접 접근 차단 확인

## Phase 9: 이메일 인증 추가 (v2.1)

### 구현
- [x] `auth.js` — `signInWithEmail`, `signUpWithEmail` 추가
- [x] `index.html` — 이메일·비밀번호 입력 폼 + 구분선 추가
- [x] `style.css` — 이메일 입력·버튼·구분선 스타일
- [x] `app.js` — 로그인/회원가입/Enter 키 이벤트 리스너 등록
- [x] `app.js` — 버튼 disabled 처리로 중복 클릭 방지 (로딩 텍스트 표시)
- [x] `auth.js` — 중복 이메일 에러 메시지 한국어 안내

### 문서 갱신
- [x] `PRD.md` v2.1 갱신 (F-10, F-11 이메일 인증 기능 추가, Out of Scope 갱신)
- [x] `TRD.md` v2.1 갱신 (auth.js 함수 목록, 이메일 인증 흐름, currentUser 변수)
- [x] `UserFlow.md` v2.1 갱신 (이메일 인증 흐름 다이어그램, localStorage → Supabase)
- [x] `OAUTH.md` v2.1 갱신 (이메일 Provider 설정 가이드 추가)
- [x] `TASKS.md` Phase 9 추가

### 검증 (예정)
- [ ] 이메일 회원가입 → 인증 이메일 수신 확인
- [ ] 이메일 링크 클릭 → 인증 완료 확인
- [ ] 이메일 로그인 → 보드 표시 확인
- [ ] 중복 이메일 회원가입 → 안내 메시지 확인
- [ ] 버튼 클릭 중 disabled 처리 확인

## Phase 10: v3.0 — 카드 메타데이터·활동로그·실시간·팀공유 (2026-05-20)

### Supabase DDL (SQL Editor에서 실행 필수)

```sql
-- Phase A: 카드 메타데이터
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS due_date  DATE,
  ADD COLUMN IF NOT EXISTS priority  TEXT DEFAULT 'medium'
    CHECK(priority IN ('low','medium','high')),
  ADD COLUMN IF NOT EXISTS tags      JSONB DEFAULT '[]';

-- Phase C: 활동 로그
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id    TEXT REFERENCES public.cards(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  detail     JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs" ON public.activity_logs
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Phase D: 팀 공유
CREATE TABLE IF NOT EXISTS public.boards (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "board access" ON public.boards
  USING (
    auth.uid() = owner_id OR
    auth.uid() IN (SELECT user_id FROM public.board_members WHERE board_id = boards.id)
  );

CREATE TABLE IF NOT EXISTS public.board_members (
  board_id   TEXT NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT DEFAULT 'member' CHECK(role IN ('owner','member')),
  joined_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (board_id, user_id)
);
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member access" ON public.board_members
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT owner_id FROM public.boards WHERE id = board_id)
  );
CREATE POLICY "join board" ON public.board_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS board_id TEXT
  REFERENCES public.boards(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "own cards" ON public.cards;
CREATE POLICY "cards select" ON public.cards FOR SELECT
  USING (
    (board_id IS NULL AND auth.uid() = user_id) OR
    board_id IN (
      SELECT id FROM public.boards WHERE owner_id = auth.uid()
      UNION SELECT board_id FROM public.board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "cards insert" ON public.cards FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      board_id IS NULL OR
      board_id IN (
        SELECT id FROM public.boards WHERE owner_id = auth.uid()
        UNION SELECT board_id FROM public.board_members WHERE user_id = auth.uid()
      )
    )
  );
CREATE POLICY "cards update" ON public.cards FOR UPDATE
  USING (
    auth.uid() = user_id OR
    board_id IN (
      SELECT id FROM public.boards WHERE owner_id = auth.uid()
      UNION SELECT board_id FROM public.board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "cards delete" ON public.cards FOR DELETE
  USING (
    auth.uid() = user_id OR
    board_id IN (
      SELECT id FROM public.boards WHERE owner_id = auth.uid()
      UNION SELECT board_id FROM public.board_members WHERE user_id = auth.uid()
    )
  );
```

### 구현
- [x] `app.js` — 카드 메타데이터 (priority, due_date, tags) CRUD
- [x] `app.js` — `updateCard()` 신규 함수
- [x] `app.js` — `logActivity()`, `loadActivityLogs()`, `renderActivityLog()`
- [x] `app.js` — `subscribeRealtime()` — Supabase Realtime 구독
- [x] `app.js` — 보드 관리: `loadBoards()`, `createBoard()`, `joinBoard()`, `switchBoard()`
- [x] `app.js` — 카드 편집 모달, 보드 설정 모달 이벤트
- [x] `index.html` — 카드 편집 모달 (`#card-modal`)
- [x] `index.html` — 활동 로그 패널 (`#activity-panel`)
- [x] `index.html` — 보드 설정 모달 (`#board-modal`)
- [x] `index.html` — 헤더: 보드 정보 + 활동 로그 토글 버튼
- [x] `style.css` — priority 뱃지, 태그, 마감일 스타일
- [x] `style.css` — 모달, 활동 로그 패널, 보드 모달 스타일

### 검증 (예정 — Supabase DDL 실행 후)
- [ ] 카드 추가 → priority 뱃지 표시
- [ ] 카드 텍스트 클릭 → 편집 모달 → 우선순위/마감일/태그 수정 → 저장
- [ ] 두 브라우저 탭 → 한 쪽 카드 추가 → 다른 탭 자동 반영
- [ ] 활동 로그 버튼 → 로그 패널 표시
- [ ] 보드 설정 → 새 보드 생성 → 전환
- [ ] 보드 ID 복사 → 다른 계정에서 참여
- [ ] 팀 공유 보드에서 카드 추가 → 다른 멤버 화면에 Realtime 반영

## Phase 7: 향후 과제 (Backlog)

- [ ] 카드 내용 인라인 편집
- [ ] 같은 컬럼 내 카드 순서 변경
- [ ] 카드 우선순위 / 레이블 (색상 태그)
- [ ] 카드 마감일 필드
- [ ] 다중 보드 지원
- [ ] 모바일 터치 드래그 지원
- [ ] 키보드 전용 카드 이동 (접근성)
- [ ] 실시간 협업 (Supabase Realtime)
- [ ] 비밀번호 재설정 (Forgot Password)
