# UserFlow — 사용자 흐름도

## 인증 흐름 (v2.0 신규)

```mermaid
flowchart TD
    A([브라우저에서 index.html 열기]) --> B[onAuthStateChange 구독\nSupabase 세션 확인]
    B --> C{유효한 세션?}

    C -- 있음 --> D[보드 화면 표시\nSupabase에서 카드 로드]
    C -- 없음 --> E[로그인 화면 표시]

    E --> F{소셜 로그인 선택}
    F -- Google 버튼 --> G[signInWithOAuth provider=google]
    F -- GitHub 버튼 --> H[signInWithOAuth provider=github]

    G --> I[Google 로그인 페이지 리다이렉트]
    H --> J[GitHub 로그인 페이지 리다이렉트]

    I --> K[인증 완료 → Supabase callback\n→ index.html 복귀]
    J --> K

    K --> L[onAuthStateChange SIGNED_IN 이벤트]
    L --> D

    D --> M[헤더: 사용자 이메일 + 로그아웃 버튼]
    M --> N{로그아웃 버튼 클릭?}
    N -- 예 --> O[signOut → location.reload]
    O --> E
```

---

## 보드 전체 흐름 (v2.0)

```mermaid
flowchart TD
    A([인증 완료 후 보드 표시]) --> B[Supabase에서 카드 목록 로드]
    B --> E[보드 렌더링\nTo-Do · In-Progress · Done]

    E --> F{사용자 액션}

    %% 카드 추가 흐름
    F -- "+ 카드 추가" 클릭 --> G[해당 컬럼에 입력 폼 표시]
    G --> H{입력 후 동작}
    H -- Enter 또는 확인 버튼 --> I{내용이 비어있음?}
    I -- 아니오 --> J[카드 생성 · localStorage 저장]
    I -- 예 --> G
    J --> E
    H -- Escape 또는 취소 버튼 --> E

    %% 카드 삭제 흐름
    F -- 카드 위 마우스 호버 --> K[삭제 버튼 ✕ 표시]
    K -- ✕ 클릭 --> L[카드 제거 · localStorage 저장]
    L --> E

    %% 드래그 앤 드롭 흐름
    F -- 카드 드래그 시작 --> M[카드 반투명 처리\ndragId 저장]
    M --> N{유효 드롭존 위로 이동?}
    N -- 예 --> O[드롭존 강조\n배경색 · 점선 테두리]
    N -- 아니오\n드래그 취소 --> P[카드 원래 위치 유지]
    P --> E
    O --> Q{드롭 실행?}
    Q -- 예 --> R{같은 컬럼에 드롭?}
    R -- 예 --> S[변경 없음]
    R -- 아니오 --> T[column 필드 변경 · localStorage 저장]
    S --> E
    T --> E
    Q -- 아니오\n드래그 취소 --> P
```

---

## 카드 추가 상세 흐름

```mermaid
sequenceDiagram
    actor U as 사용자
    participant B as 버튼 (+ 카드 추가)
    participant F as 입력 폼
    participant S as app.js (상태)
    participant L as localStorage

    U->>B: 클릭
    B->>F: 폼 표시 (textarea 포커스)
    U->>F: 텍스트 입력
    U->>F: Enter 또는 확인 버튼
    F->>S: addCard(column, text)
    S->>S: cards.push({id, text, column})
    S->>L: JSON.stringify(cards) 저장
    S->>B: renderAll() → 폼 사라짐, 카드 추가됨
```

---

## 드래그 앤 드롭 상세 흐름

```mermaid
sequenceDiagram
    actor U as 사용자
    participant C as 카드 (Card)
    participant Z as 드롭존 (.cards)
    participant S as app.js (상태)
    participant L as localStorage

    U->>C: dragstart
    C->>S: dragId = card.id
    C->>C: classList.add('dragging')

    U->>Z: dragover
    Z->>Z: classList.add('drag-over')

    U->>Z: drop
    Z->>Z: classList.remove('drag-over')
    Z->>S: moveCard(id, targetColumn)
    S->>S: card.column = targetColumn
    S->>L: JSON.stringify(cards) 저장
    S->>C: renderAll()

    C->>C: dragend → classList.remove('dragging')
```
