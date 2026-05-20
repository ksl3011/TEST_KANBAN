# Design — 기초 디자인 시스템

## 1. 컬러 팔레트

### 기본 색상 (CSS 변수)

| 변수 | HEX | 용도 |
|---|---|---|
| `--col-todo` | `#6c8ebf` | To-Do 컬럼 강조색 (청색 계열) |
| `--col-progress` | `#d6a04a` | In-Progress 컬럼 강조색 (주황·금색 계열) |
| `--col-done` | `#5ba55b` | Done 컬럼 강조색 (녹색 계열) |
| `--bg` | `#f0f2f5` | 전체 배경 |
| `--col-bg` | `#ffffff` | 컬럼 배경 |
| `--card-bg` | `#ffffff` | 카드 배경 |
| `--text` | `#1a1a2e` | 본문 텍스트 (진한 남색) |
| `--text-muted` | `#6b7280` | 보조 텍스트, 비활성 상태 |

### 상태 색상

| 상태 | 색상 | 용도 |
|---|---|---|
| 드롭존 강조 배경 | `#e8f0fe` | 드래그 중 유효 드롭존 |
| 드롭존 강조 테두리 | `#6c8ebf` | 점선 테두리 |
| 삭제 버튼 호버 전경 | `#e05252` | 삭제 아이콘 빨강 |
| 삭제 버튼 호버 배경 | `#fdeaea` | 삭제 버튼 배경 연분홍 |
| 확인 버튼 배경 | `#1a1a2e` | 폼 확인 버튼 (헤더 동일) |

---

## 2. 타이포그래피

| 용도 | font-size | font-weight | 비고 |
|---|---|---|---|
| 앱 헤더 | `1.3rem` | 700 | letter-spacing `.03em` |
| 컬럼 타이틀 | `0.95rem` | 700 | letter-spacing `.02em` |
| 카드 본문 | `0.88rem` | 400 | line-height `1.5` |
| 버튼·폼 | `0.83–0.84rem` | 400–600 | 상황에 따라 |
| 카드 수 배지 | `0.78rem` | 600 | — |

**폰트 패밀리**: `'Segoe UI', system-ui, sans-serif`  
(별도 웹폰트 로드 없음 — 시스템 폰트 스택)

---

## 3. 간격 시스템

| 토큰 | 값 | 사용처 |
|---|---|---|
| `space-xs` | `6px` | 버튼 사이 갭, 소형 패딩 |
| `space-sm` | `8–10px` | 카드 내부 패딩, 폼 갭 |
| `space-md` | `12–14px` | 컬럼 패딩, 카드 패딩 |
| `space-lg` | `16–18px` | 컬럼 헤더 패딩, 보드 갭 |
| `space-xl` | `24–28px` | 보드 외부 여백 |

---

## 4. 모서리(Border Radius)

| 적용 대상 | 값 |
|---|---|
| 컬럼 (`--radius`) | `10px` |
| 카드 | `8px` |
| 버튼 | `7–8px` |
| 배지 (카드 수) | `999px` (pill) |

---

## 5. 그림자

| 변수 | 값 | 사용처 |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.1)` | 컬럼, 카드 기본 |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,.12)` | 카드 호버, 앱 헤더 |

---

## 6. 컴포넌트 명세

### 6.1 Board (`.board`)

```
display: flex
gap: 18px
padding: 24px 28px
align-items: flex-start
overflow-x: auto
```

### 6.2 Column (`.column`)

```
flex: 1
min-width: 260px
max-width: 360px
background: white
border-radius: 10px
box-shadow: --shadow-sm

  ├─ .column-header  ← 3px solid var(--accent) 하단 테두리
  ├─ .cards          ← 드롭존, flex-direction: column, gap: 10px
  └─ .add-btn        ← 점선 테두리 버튼
```

### 6.3 Card (`.card`)

```
기본:
  background: white
  border-radius: 8px
  padding: 12px 14px
  box-shadow: --shadow-sm
  cursor: grab
  border-left: 4px solid transparent  ← 미래 우선순위 색상 확장 포인트

호버:
  box-shadow: --shadow-md
  transform: translateY(-1px)

드래그 중 (.dragging):
  opacity: 0.4
  cursor: grabbing
  transform: rotate(2deg) scale(1.02)
```

### 6.4 Add Button (`.add-btn`)

```
기본:  border: 1.5px dashed #c4c9d4, 투명 배경, 회색 텍스트
호버:  연한 회색 배경, 진한 테두리, 진한 텍스트
```

### 6.5 Card Form (`.card-form`)

```
textarea: 1.5px solid #9ba5b4, border-radius 8px, resize: vertical
  포커스: border-color → --col-todo (#6c8ebf)

확인 버튼: dark (#1a1a2e), white text, flex: 1
취소 버튼: transparent, muted text, dashed border
```

---

## 7. 인터랙션 & 애니메이션

| 요소 | 속성 | 값 |
|---|---|---|
| 카드 호버 | `transition` | `box-shadow .15s, transform .1s, opacity .15s` |
| 드롭존 배경 | `transition` | `background .15s` |
| 삭제 버튼 노출 | `transition` | `opacity .15s` |
| 버튼 배경 | `transition` | `background .15s` |

---

## 8. 헤더

```
background: #1a1a2e  (진한 남색)
color: white
padding: 16px 28px
box-shadow: --shadow-md
```

---

## 9. 접근성 체크리스트

- [x] 삭제 버튼 `title="삭제"` 속성으로 툴팁 제공
- [x] 버튼 요소는 `<button>` 태그 사용 (키보드 접근 가능)
- [x] 색상 대비: 컬럼 타이틀 색상과 흰 배경의 명암비 ≥ 4.5:1 목표
- [ ] 드래그 앤 드롭 키보드 대안 (향후 과제)
