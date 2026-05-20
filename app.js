const STORAGE_KEY = 'kanban-cards';

let cards = loadFromStorage();
let dragId = null;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [
    { id: uid(), text: '디자인 시안 검토', column: 'todo' },
    { id: uid(), text: '백엔드 API 연동', column: 'inprogress' },
    { id: uid(), text: '유닛 테스트 작성', column: 'done' },
  ];
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addCard(column, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  cards.push({ id: uid(), text: trimmed, column });
  save();
  renderAll();
}

function deleteCard(id) {
  cards = cards.filter(c => c.id !== id);
  save();
  renderAll();
}

function moveCard(id, targetColumn) {
  const card = cards.find(c => c.id === id);
  if (card && card.column !== targetColumn) {
    card.column = targetColumn;
    save();
    renderAll();
  }
}

// ── 렌더링 ──────────────────────────────────────────

function renderAll() {
  const columns = ['todo', 'inprogress', 'done'];
  columns.forEach(col => {
    const zone = document.querySelector(`.cards[data-column="${col}"]`);
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

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    btn.addEventListener('click', () => {
      const column = btn.dataset.column;
      showForm(column, btn);
    });
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
    if (!textarea.value.trim()) {
      textarea.focus();
      return;
    }
    addCard(column, textarea.value);
    cleanup();
  };

  const cancel = () => {
    cleanup();
  };

  function cleanup() {
    form.remove();
    addBtn.style.display = '';
  }

  form.querySelector('.btn-confirm').addEventListener('click', confirm);
  form.querySelector('.btn-cancel').addEventListener('click', cancel);

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      cancel();
    }
  });
}

// ── 초기화 ────────────────────────────────────────────

renderAll();
initDropZones();
initAddButtons();
