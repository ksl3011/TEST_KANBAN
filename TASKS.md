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
- [x] `loadFromStorage()` — localStorage 로드 · 샘플 폴백
- [x] `save()` — localStorage 저장
- [x] `addCard()` — 카드 추가
- [x] `deleteCard()` — 카드 삭제
- [x] `moveCard()` — 컬럼 간 이동
- [x] `renderAll()` — 전체 DOM 재구성
- [x] `buildCard()` — 카드 DOM 생성 + 이벤트
- [x] `escapeHtml()` — XSS 방지
- [x] `initDropZones()` — 드롭존 이벤트 등록
- [x] `initAddButtons()` — 추가 버튼 이벤트 등록
- [x] `showForm()` — 인라인 입력 폼 (Enter · Esc)
- [x] **버그 수정**: `showForm()` 빈 텍스트 확인 시 폼이 닫히던 문제 → 포커스 유지로 수정
- [x] **버그 수정**: `cancel` 핸들러의 불필요한 `renderAll()` 제거

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
- [x] 새로고침 후 localStorage 복원 확인
- [x] 빈 텍스트 카드 추가 방지 확인 (버그 수정 후 코드 검토 완료)
- [ ] 브라우저 실환경 통합 테스트 (수동)

## Phase 7: 향후 과제 (Backlog)

- [ ] 카드 내용 인라인 편집
- [ ] 같은 컬럼 내 카드 순서 변경
- [ ] 카드 우선순위 / 레이블 (색상 태그)
- [ ] 카드 마감일 필드
- [ ] 다중 보드 지원
- [ ] 모바일 터치 드래그 지원
- [ ] 키보드 전용 카드 이동 (접근성)
- [ ] 서버 동기화 / 실시간 협업
