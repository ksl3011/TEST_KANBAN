let cards = [];
let dragId = null;
let boardInitialized = false;
let currentUser = null;
let currentBoard = null;
let realtimeChannel = null;

// ── 유틸 ─────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function priorityLabel(p) {
  return { low: '낮음', medium: '보통', high: '높음' }[p] ?? '보통';
}

function actionLabel(a) {
  return { add: '카드 추가', delete: '카드 삭제', move: '카드 이동', update: '카드 수정' }[a] ?? a;
}

function relativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return m + '분 전';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '시간 전';
  return Math.floor(h / 24) + '일 전';
}

// ── Supabase CRUD ────────────────────────────────────

async function loadCards() {
  let query = supabaseClient
    .from('cards')
    .select('id, text, column, due_date, priority, tags, board_id')
    .order('created_at');
  if (currentBoard) {
    query = query.eq('board_id', currentBoard.id);
  } else {
    query = query.is('board_id', null);
  }
  const { data, error } = await query;
  if (error) { alert('카드 로드 실패: ' + error.message); return []; }
  return data;
}

async function addCard(column, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const card = {
    id: uid(), text: trimmed, column,
    user_id: currentUser.id,
    priority: 'medium', tags: [],
    board_id: currentBoard ? currentBoard.id : null,
  };
  const { error } = await supabaseClient.from('cards').insert(card);
  if (error) { alert('카드 추가 실패: ' + error.message); return; }
  cards.push(card);
  renderAll();
  logActivity('add', card.id, { text: trimmed, column });
}

async function deleteCard(id) {
  const card = cards.find(c => c.id === id);
  const { error } = await supabaseClient.from('cards').delete().eq('id', id);
  if (error) { alert('카드 삭제 실패: ' + error.message); return; }
  cards = cards.filter(c => c.id !== id);
  renderAll();
  if (card) logActivity('delete', id, { text: card.text, column: card.column });
}

async function moveCard(id, targetColumn) {
  const card = cards.find(c => c.id === id);
  if (!card || card.column === targetColumn) return;
  const { error } = await supabaseClient
    .from('cards')
    .update({ column: targetColumn })
    .eq('id', id);
  if (error) { alert('카드 이동 실패: ' + error.message); return; }
  const fromColumn = card.column;
  card.column = targetColumn;
  renderAll();
  logActivity('move', id, { from: fromColumn, to: targetColumn });
}

async function updateCard(id, updates) {
  const { error } = await supabaseClient.from('cards').update(updates).eq('id', id);
  if (error) { alert('카드 수정 실패: ' + error.message); return; }
  const card = cards.find(c => c.id === id);
  Object.assign(card, updates);
  renderAll();
  logActivity('update', id, updates);
}

// ── 활동 로그 ────────────────────────────────────────

async function logActivity(action, cardId, detail) {
  try {
    await supabaseClient.from('activity_logs').insert({
      user_id: currentUser.id, card_id: cardId, action, detail,
    });
  } catch (_) {}
}

async function loadActivityLogs() {
  const { data } = await supabaseClient
    .from('activity_logs')
    .select('id, action, detail, created_at, card_id')
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

function renderActivityLog(logs) {
  const el = document.getElementById('activity-log-list');
  if (!el) return;
  if (!logs.length) {
    el.innerHTML = '<li class="log-empty">활동 없음</li>';
    return;
  }
  el.innerHTML = logs.map(l => `
    <li class="log-item">
      <span class="log-action">${actionLabel(l.action)}</span>
      <span class="log-time">${relativeTime(l.created_at)}</span>
    </li>
  `).join('');
}

// ── 보드 관리 ────────────────────────────────────────

async function loadBoards() {
  const { data } = await supabaseClient
    .from('boards')
    .select('id, name, owner_id')
    .order('created_at');
  return data ?? [];
}

async function createBoard(name) {
  const id = uid();
  const { error } = await supabaseClient.from('boards').insert({
    id, name, owner_id: currentUser.id,
  });
  if (error) { alert('보드 생성 실패: ' + error.message); return null; }
  await supabaseClient.from('board_members').insert({
    board_id: id, user_id: currentUser.id, role: 'owner',
  });
  return { id, name, owner_id: currentUser.id };
}

async function joinBoard(boardId) {
  const { error } = await supabaseClient.from('board_members').insert({
    board_id: boardId, user_id: currentUser.id, role: 'member',
  });
  if (error) {
    if (error.code === '23505') { alert('이미 참여 중인 보드입니다.'); }
    else { alert('보드 참여 실패: ' + error.message); }
    return false;
  }
  return true;
}

async function switchBoard(board) {
  currentBoard = board;
  document.getElementById('board-name').textContent = board ? board.name : '개인 보드';
  cards = await loadCards();
  renderAll();
  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
  }
  realtimeChannel = subscribeRealtime();
}

// ── 실시간 동기화 ─────────────────────────────────────

function subscribeRealtime() {
  const channelId = 'cards-' + (currentBoard ? currentBoard.id : 'personal-' + currentUser.id);
  const channel = supabaseClient
    .channel(channelId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cards' }, payload => {
      if (cards.find(c => c.id === payload.new.id)) return;
      const relevant = currentBoard
        ? payload.new.board_id === currentBoard.id
        : !payload.new.board_id && payload.new.user_id === currentUser.id;
      if (relevant) { cards.push(payload.new); renderAll(); }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cards' }, payload => {
      const idx = cards.findIndex(c => c.id === payload.new.id);
      if (idx !== -1) { cards[idx] = payload.new; renderAll(); }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cards' }, payload => {
      const before = cards.length;
      cards = cards.filter(c => c.id !== payload.old.id);
      if (cards.length !== before) renderAll();
    })
    .subscribe();
  return channel;
}

// ── 렌더링 ──────────────────────────────────────────

function renderAll() {
  ['todo', 'inprogress', 'done'].forEach(col => {
    const zone    = document.querySelector(`.cards[data-column="${col}"]`);
    const counter = document.querySelector(`.column-count[data-column="${col}"]`);
    const colCards = cards.filter(c => c.column === col);
    zone.innerHTML = '';
    colCards.forEach(c => zone.appendChild(buildCard(c)));
    counter.textContent = colCards.length;
  });
}

function buildCard(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = card.id;

  const priority = card.priority ?? 'medium';
  const tags = Array.isArray(card.tags) ? card.tags : [];
  const dueDateHtml = card.due_date
    ? `<span class="card-due">마감: ${escapeHtml(card.due_date)}</span>`
    : '';
  const tagsHtml = tags.length
    ? `<div class="card-tags">${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  el.innerHTML = `
    <div class="card-header">
      <span class="card-priority card-priority--${priority}">${priorityLabel(priority)}</span>
      <button class="card-delete" title="삭제">✕</button>
    </div>
    <span class="card-text">${escapeHtml(card.text)}</span>
    ${dueDateHtml}
    ${tagsHtml}
  `;

  el.querySelector('.card-delete').addEventListener('click', e => {
    e.stopPropagation();
    deleteCard(card.id);
  });

  el.querySelector('.card-text').addEventListener('click', e => {
    e.stopPropagation();
    openCardModal(card);
  });

  el.addEventListener('dragstart', e => {
    dragId = card.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
    requestAnimationFrame(() => el.classList.add('dragging'));
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    dragId = null;
  });

  return el;
}

// ── 카드 편집 모달 ────────────────────────────────────

let modalCardId = null;

function openCardModal(card) {
  modalCardId = card.id;
  document.getElementById('modal-text').value = card.text;
  document.getElementById('modal-priority').value = card.priority ?? 'medium';
  document.getElementById('modal-due').value = card.due_date ?? '';
  document.getElementById('modal-tags').value = (Array.isArray(card.tags) ? card.tags : []).join(', ');
  document.getElementById('card-modal').style.display = '';
}

function closeCardModal() {
  document.getElementById('card-modal').style.display = 'none';
  modalCardId = null;
}

// ── 보드 설정 모달 ────────────────────────────────────

async function openBoardModal() {
  const boards = await loadBoards();
  renderBoardModal(boards);
  document.getElementById('board-modal').style.display = '';
}

function closeBoardModal() {
  document.getElementById('board-modal').style.display = 'none';
}

async function renderBoardModal(boards) {
  const listEl = document.getElementById('board-list');
  const personalItem = `<li class="board-list-item${currentBoard === null ? ' active' : ''}" data-board-id="">개인 보드${currentBoard === null ? ' <span class="board-current">현재</span>' : ''}</li>`;
  const boardItems = boards.map(b => `
    <li class="board-list-item${currentBoard && currentBoard.id === b.id ? ' active' : ''}" data-board-id="${b.id}">
      ${escapeHtml(b.name)}${currentBoard && currentBoard.id === b.id ? ' <span class="board-current">현재</span>' : ''}
    </li>
  `).join('');
  listEl.innerHTML = personalItem + boardItems;
  listEl.querySelectorAll('.board-list-item').forEach(item => {
    item.addEventListener('click', async () => {
      const bId = item.dataset.boardId;
      if (!bId) {
        await switchBoard(null);
      } else {
        const board = boards.find(b => b.id === bId);
        if (board) await switchBoard(board);
      }
      closeBoardModal();
    });
  });

  // 현재 보드 ID 표시 (공유용)
  const shareEl = document.getElementById('board-share-id');
  shareEl.textContent = currentBoard ? currentBoard.id : '';
  document.getElementById('board-share-row').style.display = currentBoard ? '' : 'none';
}

// ── 드롭존 이벤트 ────────────────────────────────────

function initDropZones() {
  document.querySelectorAll('.cards').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', e => {
      // dragleave는 자식 요소 진입 시에도 발화하므로 relatedTarget 확인
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain') || dragId;
      if (id) moveCard(id, zone.dataset.column);
    });
  });
}

// ── 카드 추가 폼 ──────────────────────────────────────

function initAddButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => showForm(btn.dataset.column, btn));
  });
}

function showForm(column, addBtn) {
  if (document.querySelector('.card-form')) return;

  addBtn.style.display = 'none';

  const form = document.createElement('div');
  form.className = 'card-form';
  form.innerHTML = `
    <textarea placeholder="카드 내용을 입력하세요" autofocus></textarea>
    <div class="card-form-actions">
      <button class="btn-confirm">확인</button>
      <button class="btn-cancel">취소</button>
    </div>
  `;

  addBtn.insertAdjacentElement('beforebegin', form);

  const textarea = form.querySelector('textarea');
  textarea.focus();

  const confirm = () => {
    if (!textarea.value.trim()) { textarea.focus(); return; }
    addCard(column, textarea.value);
    cleanup();
  };

  const cancel = () => { cleanup(); };

  function cleanup() {
    form.remove();
    addBtn.style.display = '';
  }

  form.querySelector('.btn-confirm').addEventListener('click', confirm);
  form.querySelector('.btn-cancel').addEventListener('click', cancel);

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirm(); }
    else if (e.key === 'Escape') cancel();
  });
}

// ── 인증·화면 전환 ─────────────────────────────────────

function showLoginScreen() {
  document.getElementById('login-screen').style.display = '';
  document.getElementById('app').style.display = 'none';
}

async function initBoard(user) {
  console.log('[initBoard] start', user.email);
  currentUser = user;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = '';
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('board-name').textContent = '개인 보드';
  console.log('[initBoard] board visible');

  cards = await loadCards();
  renderAll();
  initDropZones();
  initAddButtons();

  loadActivityLogs().then(renderActivityLog);
  realtimeChannel = subscribeRealtime();

  document.getElementById('btn-logout').addEventListener('click', () => AuthKanban.signOut());
}

// ── 초기화 ────────────────────────────────────────────

document.getElementById('btn-google').addEventListener('click', () => AuthKanban.signInWithGoogle());
document.getElementById('btn-github').addEventListener('click', () => AuthKanban.signInWithGitHub());

document.getElementById('btn-email-login').addEventListener('click', async () => {
  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  if (!email || !password) { alert('이메일과 비밀번호를 입력하세요.'); return; }
  const btn = document.getElementById('btn-email-login');
  btn.disabled = true;
  btn.textContent = '로그인 중…';
  await AuthKanban.signInWithEmail(email, password);
  btn.disabled = false;
  btn.textContent = '로그인';
});

document.getElementById('btn-email-signup').addEventListener('click', async () => {
  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  if (!email || !password) { alert('이메일과 비밀번호를 입력하세요.'); return; }
  if (password.length < 6) { alert('비밀번호는 6자 이상이어야 합니다.'); return; }
  const btn = document.getElementById('btn-email-signup');
  btn.disabled = true;
  btn.textContent = '처리 중…';
  await AuthKanban.signUpWithEmail(email, password);
  btn.disabled = false;
  btn.textContent = '회원가입';
});

document.getElementById('input-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-email-login').click();
});

// 카드 편집 모달
document.getElementById('modal-save').addEventListener('click', async () => {
  if (!modalCardId) return;
  const text = document.getElementById('modal-text').value.trim();
  if (!text) { alert('내용을 입력하세요.'); return; }
  const priority = document.getElementById('modal-priority').value;
  const due_date = document.getElementById('modal-due').value || null;
  const tagsRaw = document.getElementById('modal-tags').value;
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  await updateCard(modalCardId, { text, priority, due_date, tags });
  closeCardModal();
});
document.getElementById('modal-cancel').addEventListener('click', closeCardModal);
document.getElementById('modal-overlay').addEventListener('click', closeCardModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('card-modal').style.display !== 'none') closeCardModal();
    if (document.getElementById('board-modal').style.display !== 'none') closeBoardModal();
  }
});

// 활동 로그 토글
document.getElementById('btn-activity').addEventListener('click', () => {
  const panel = document.getElementById('activity-panel');
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? '' : 'none';
  if (isHidden) loadActivityLogs().then(renderActivityLog);
});

// 보드 설정 모달
document.getElementById('btn-board-settings').addEventListener('click', openBoardModal);
document.getElementById('btn-board-modal-close').addEventListener('click', closeBoardModal);
document.getElementById('board-modal-overlay').addEventListener('click', closeBoardModal);

document.getElementById('btn-board-create').addEventListener('click', async () => {
  const name = document.getElementById('input-board-name').value.trim();
  if (!name) { alert('보드 이름을 입력하세요.'); return; }
  const btn = document.getElementById('btn-board-create');
  btn.disabled = true;
  const board = await createBoard(name);
  btn.disabled = false;
  if (board) {
    document.getElementById('input-board-name').value = '';
    await switchBoard(board);
    closeBoardModal();
  }
});

document.getElementById('btn-board-join').addEventListener('click', async () => {
  const boardId = document.getElementById('input-join-board-id').value.trim();
  if (!boardId) { alert('보드 ID를 입력하세요.'); return; }
  const btn = document.getElementById('btn-board-join');
  btn.disabled = true;
  const ok = await joinBoard(boardId);
  btn.disabled = false;
  if (ok) {
    document.getElementById('input-join-board-id').value = '';
    // 참여한 보드로 전환
    const boards = await loadBoards();
    const board = boards.find(b => b.id === boardId);
    if (board) {
      await switchBoard(board);
      closeBoardModal();
    }
  }
});

document.getElementById('btn-board-share-copy').addEventListener('click', () => {
  const id = document.getElementById('board-share-id').textContent;
  navigator.clipboard.writeText(id).then(() => alert('보드 ID가 복사되었습니다.\n팀원에게 공유하세요.'));
});

AuthKanban.onAuthStateChange((event, session) => {
  console.log('[Auth]', event, session?.user?.email ?? 'no session');
  if (session && !boardInitialized) {
    boardInitialized = true;
    initBoard(session.user);
  } else if (!session && event === 'SIGNED_OUT') {
    console.log('[Auth] → showLoginScreen (SIGNED_OUT)');
    boardInitialized = false;
    showLoginScreen();
  } else if (!session && event === 'INITIAL_SESSION') {
    if (!boardInitialized) {
      console.log('[Auth] → showLoginScreen (INITIAL_SESSION, no session)');
      showLoginScreen();
    } else {
      console.log('[Auth] INITIAL_SESSION ignored (board already up)');
    }
  } else {
    console.log('[Auth] event ignored (boardInitialized=' + boardInitialized + ', hasSession=' + !!session + ')');
  }
});
