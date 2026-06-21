const API = CONFIG.BASE_URL;

let token         = sessionStorage.getItem('adminToken');
let currentPage   = 1;
let currentStatus = '';

document.addEventListener('DOMContentLoaded', () => {
  if (token) showDashboard();
  else       showLogin();
  bindEvents();
});

function bindEvents() {
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentStatus = item.dataset.section === 'flagged' ? 'flagged' : '';
      currentPage   = 1;
      loadComments();
    });
  });

  document.getElementById('edit-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('edit-save-btn').addEventListener('click', handleSave);
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('edit-modal')) closeModal();
  });
}

async function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('login-error');

  if (!username || !password) { showError(errorEl, 'Username and password are required.'); return; }

  const btn = document.getElementById('login-btn');
  btn.textContent = 'Signing in...';
  btn.disabled    = true;

  try {
    const res  = await fetch(`${API}/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!data.success) {
      showError(errorEl, data.message || 'Login failed.');
      btn.textContent = 'Login';
      btn.disabled    = false;
      return;
    }

    token = data.token;
    sessionStorage.setItem('adminToken', token);
    document.getElementById('admin-username').textContent = data.user.username;
    showDashboard();
  } catch {
    showError(errorEl, 'Could not connect to server.');
    btn.textContent = 'Login';
    btn.disabled    = false;
  }
}

function handleLogout() {
  token = null;
  sessionStorage.removeItem('adminToken');
  showLogin();
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadComments();
}

async function loadComments() {
  const list = document.getElementById('comments-list');
  list.innerHTML = '<p class="admin-loading">Loading...</p>';

  try {
    const params = new URLSearchParams({ page: currentPage, limit: 20 });
    if (currentStatus) params.append('status', currentStatus);

    const res  = await fetch(`${API}/admin/comments?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.success) {
      if (res.status === 401) { handleLogout(); return; }
      list.innerHTML = `<p class="admin-error">Error: ${data.message}</p>`;
      return;
    }

    document.getElementById('stat-approved').textContent = data.meta.approvedCount ?? data.pagination.total;
    document.getElementById('stat-flagged').textContent  = data.meta.flaggedCount;

    if (data.data.length === 0) {
      list.innerHTML = '<p class="admin-empty">No reviews to show.</p>';
    } else {
      list.innerHTML = '';
      data.data.forEach(c => list.appendChild(buildCommentCard(c)));
    }

    renderPagination(data.pagination);
  } catch {
    list.innerHTML = '<p class="admin-error">Could not connect to server.</p>';
  }
}

function buildCommentCard(c) {
  const date     = new Date(c.createdAt).toLocaleDateString('en-US');
  const aiLabel  = c.aiScore?.label || 'neutral';
  const aiScore  = c.aiScore?.satisfactionScore ?? '—';
  const labelMap = { positive: '😊 Positive', negative: '😞 Negative', neutral: '😐 Neutral' };

  const card = document.createElement('div');
  card.className   = `comment-card${c.isFlagged ? ' flagged' : ''}`;
  card.dataset.id  = c._id;

  const header = document.createElement('div');
  header.className = 'comment-header';

  const placeSpan = document.createElement('span');
  placeSpan.className   = 'comment-place';
  placeSpan.textContent = `📍 ${c.placeName}`;

  const metaDiv = document.createElement('div');
  metaDiv.className = 'comment-meta';

  const starsSpan = document.createElement('span');
  starsSpan.className   = 'comment-stars';
  starsSpan.textContent = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);

  const aiBadge = document.createElement('span');
  aiBadge.className   = `badge badge-${aiLabel}`;
  aiBadge.textContent = `${labelMap[aiLabel] || aiLabel} · AI: ${aiScore}%`;

  if (c.isFlagged) {
    const flagBadge = document.createElement('span');
    flagBadge.className   = 'badge badge-flagged';
    flagBadge.textContent = `⚠️ ${c.flagReason || 'Suspicious content'}`;
    metaDiv.appendChild(flagBadge);
  }

  const dateSpan = document.createElement('span');
  dateSpan.className   = 'comment-date';
  dateSpan.textContent = date;

  metaDiv.appendChild(starsSpan);
  metaDiv.appendChild(aiBadge);
  metaDiv.appendChild(dateSpan);
  header.appendChild(placeSpan);
  header.appendChild(metaDiv);

  const p = document.createElement('p');
  p.className   = 'comment-text';
  p.textContent = c.comment;

  const actions = document.createElement('div');
  actions.className = 'comment-actions';

  const editBtn = document.createElement('button');
  editBtn.className   = 'btn-edit';
  editBtn.textContent = '✏️ Edit';
  editBtn.addEventListener('click', () => openEditModal(c._id, c.comment, c.rating));

  const deleteBtn = document.createElement('button');
  deleteBtn.className   = 'btn-delete';
  deleteBtn.textContent = '🗑️ Delete';
  deleteBtn.addEventListener('click', () => deleteComment(c._id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  card.appendChild(header);
  card.appendChild(p);
  card.appendChild(actions);
  return card;
}

async function deleteComment(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  try {
    const res  = await fetch(`${API}/admin/comments/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) loadComments();
    else alert(data.message || 'Delete failed.');
  } catch { alert('Delete failed.'); }
}

function openEditModal(id, comment, rating) {
  document.getElementById('edit-id').value      = id;
  document.getElementById('edit-comment').value = comment;
  document.getElementById('edit-rating').value  = rating;
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

async function handleSave() {
  const id      = document.getElementById('edit-id').value;
  const comment = document.getElementById('edit-comment').value.trim();
  const rating  = document.getElementById('edit-rating').value;

  if (!comment) { alert('Review cannot be empty.'); return; }

  const btn = document.getElementById('edit-save-btn');
  btn.textContent = 'Saving...';
  btn.disabled    = true;

  try {
    const res  = await fetch(`${API}/admin/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ comment, rating: parseInt(rating) })
    });
    const data = await res.json();
    if (data.success) { closeModal(); loadComments(); }
    else alert(data.message || 'Update failed.');
  } catch {
    alert('Update failed.');
  } finally {
    btn.textContent = 'Save';
    btn.disabled    = false;
  }
}

function renderPagination(pagination) {
  const el = document.getElementById('pagination');
  if (pagination.pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = '';
  for (let i = 1; i <= pagination.pages; i++) {
    const btn = document.createElement('button');
    btn.className   = `page-btn${i === currentPage ? ' active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; loadComments(); });
    el.appendChild(btn);
  }
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}
