let cards = [];
let dragId = null;
let boardInitialized = false;

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

// ── Supabase CRUD ────────────────────────────────────

async function loadCards() {
  const { data, error } = await supabaseClient
    .from('cards')
    .select('id, text, column')
    .order('created_at');
  if (error) { alert('카드 로드 실패: ' + error.message); return []; }
  return data;
}

async function addCard(column, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const card = { id: uid(), text: trimmed, column };
  const { error } = await supabaseClient.from('cards').insert(card);
  if (error) { alert('카드 추가 실패: ' + error.message); return; }
  cards.push(card);
  renderAll();
}

async function deleteCard(id) {
  const { error } = await supabaseClient.from('cards').delete().eq('id', id);
  if (error) { alert('카드 삭제 실패: ' + error.message); return; }
  cards = cards.filter(c => c.id !== id);
  renderAll();
}

async function moveCard(id, targetColumn) {
  const card = cards.find(c => c.id === id);
  if (!card || card.column === targetColumn) return;
  const { error } = await supabaseClient
    .from('cards')
    .update({ column: targetColumn })
    .eq('id', id);
  if (error) { alert('카드 이동 실패: ' + error.message); return; }
  card.column = targetColumn;
  renderAll();
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

  el.innerHTML = `
    <span class="card-text">${escapeHtml(card.text)}</span>
    <button class="card-delete" title="삭제">✕</button>
  `;

  el.querySelector('.card-delete').addEventListener('click', e => {
    e.stopPropagation();
    deleteCard(card.id);
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
  document.getElementById('login-screen').hidden = false;
  document.getElementById('app').hidden = true;
}

async function initBoard(user) {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('app').hidden = false;
  document.getElementById('user-email').textContent = user.email;

  cards = await loadCards();
  renderAll();
  initDropZones();
  initAddButtons();

  document.getElementById('btn-logout').addEventListener('click', () => {
    AuthKanban.signOut();
  });
}

// ── 초기화 ────────────────────────────────────────────

document.getElementById('btn-google').addEventListener('click', () => AuthKanban.signInWithGoogle());
document.getElementById('btn-github').addEventListener('click', () => AuthKanban.signInWithGitHub());

AuthKanban.onAuthStateChange((event, session) => {
  console.log('[Auth]', event, session?.user?.email ?? 'no session', location.href);
  if (session && !boardInitialized) {
    boardInitialized = true;
    initBoard(session.user);
  } else if (!session && (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT')) {
    boardInitialized = false;
    showLoginScreen();
  }
});
