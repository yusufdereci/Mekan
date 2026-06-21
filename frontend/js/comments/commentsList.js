let currentPlaceId   = null;
let currentPlaceName = null;
let commentPage      = 1;

function initComments(placeId, placeName) {
  currentPlaceId   = placeId;
  currentPlaceName = placeName;
  commentPage      = 1;
  loadComments();
}

async function loadComments() {
  const list = document.getElementById('comments-list');

  list.innerHTML = Array(3).fill(`
    <div style="margin-bottom:10px">
      <div class="skeleton skeleton-line short" style="margin-bottom:6px"></div>
      <div class="skeleton skeleton-line full"></div>
      <div class="skeleton skeleton-line medium"></div>
    </div>
  `).join('');

  try {
    const data = await API.getComments(currentPlaceId, commentPage, 5);

    if (!data.success || data.data.length === 0) {
      list.innerHTML = '<p class="muted">No reviews yet.</p>';
      document.getElementById('comments-pagination').innerHTML = '';
      return;
    }

    list.innerHTML = '';
    data.data.forEach((c, i) => list.appendChild(buildCommentCard(c, i)));
    renderCommentPagination(data.pagination);

  } catch {
    list.innerHTML = '<p class="muted" style="color:var(--danger)">Failed to load reviews.</p>';
  }
}

function buildCommentCard(c, i = 0) {
  const aiLabel = c.aiScore?.label || 'neutral';
  const date    = new Date(c.createdAt).toLocaleDateString('en-US');

  const card = document.createElement('div');
  card.className = `comment-card ${aiLabel} anim-fadeInUp`;
  card.style.animationDelay = `${i * 0.07}s`;

  const header = document.createElement('div');
  header.className = 'comment-card-header';

  const starsSpan = document.createElement('span');
  starsSpan.className   = 'comment-stars';
  starsSpan.textContent = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);

  const badge = document.createElement('span');
  badge.className   = `badge badge-${aiLabel}`;
  badge.textContent = t(aiLabel);

  const dateSpan = document.createElement('span');
  dateSpan.textContent = date;

  header.appendChild(starsSpan);
  header.appendChild(badge);
  header.appendChild(dateSpan);

  const p = document.createElement('p');
  p.textContent = c.comment;

  card.appendChild(header);
  card.appendChild(p);
  return card;
}

function renderCommentPagination(pagination) {
  const el = document.getElementById('comments-pagination');
  el.innerHTML = '';
  if (pagination.pages <= 1) return;

  for (let i = 1; i <= pagination.pages; i++) {
    const btn = document.createElement('button');
    btn.className   = `page-btn${i === commentPage ? ' active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      commentPage = i;
      loadComments();
    });
    el.appendChild(btn);
  }
}
