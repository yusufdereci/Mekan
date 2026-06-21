const API_URL = CONFIG.BASE_URL;

let pomPlaceId = null;
let pomPage    = 1;
let pomChart   = null;

document.addEventListener('DOMContentLoaded', async () => {
  onLangReady = async () => {
    if (!pomPlaceId) {
      await loadPlaceOfMonth();
    } else {
      refreshDynamicTexts();
      loadPomComments();
    }
  };
});

async function loadPlaceOfMonth() {
  try {
    const res  = await fetch(`${API_URL}/stats/place-of-month`);
    const data = await res.json();

    if (!data.success || !data.data) { showEmpty(); return; }

    const place = data.data;
    pomPlaceId  = place.placeId;

    document.getElementById('pom-title').textContent  = place.placeName;
    document.getElementById('pom-period').textContent =
      data.period === 'this_month' ? getCurrentMonthLabel() : getLastMonthLabel();

    const pct = place.satisfactionPct ?? 0;
    document.getElementById('pom-score').textContent    = `${pct}%`;
    document.getElementById('pom-name').textContent     = place.placeName;
    document.getElementById('pom-rating').textContent   = `${place.avgRating ?? '—'} ★`;
    document.getElementById('pom-reviews').textContent  = place.totalReviews;
    document.getElementById('pom-positive').textContent = `${place.positiveCount} 👍`;

    setTimeout(() => {
      document.getElementById('pom-bar-fill').style.width = `${pct}%`;
    }, 300);

    document.getElementById('pom-map-link').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('pomSearch', place.placeName);
      window.location.href = 'home.html';
    });

    initPomChart(pct);
    loadPomComments();
  } catch {
    showEmpty();
  }
}

function refreshDynamicTexts() {
  const periodEl = document.getElementById('pom-period');
  if (periodEl && periodEl.textContent) {
    periodEl.textContent = getCurrentMonthLabel();
  }
}

function initPomChart(pct) {
  const ctx = document.getElementById('pom-chart').getContext('2d');
  if (pomChart) pomChart.destroy();
  pomChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [pct, 100 - pct],
        backgroundColor: ['#2d7a4f', '#eee9df'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '78%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 1000, easing: 'easeInOutQuart' }
    }
  });
}

async function loadPomComments() {
  const list = document.getElementById('pom-comments-list');
  const lang = localStorage.getItem('lang') || 'en';

  list.innerHTML = Array(3).fill(`
    <div style="margin-bottom:10px">
      <div class="skeleton skeleton-line short" style="margin-bottom:6px"></div>
      <div class="skeleton skeleton-line full"></div>
      <div class="skeleton skeleton-line medium"></div>
    </div>
  `).join('');

  try {
    const res  = await fetch(`${API_URL}/comments/${pomPlaceId}?page=${pomPage}&limit=5`);
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      list.innerHTML = `<p class="muted" style="text-align:center;padding:1rem">${t('pomNoComments')}</p>`;
      return;
    }

    list.innerHTML = '';
    data.data.forEach((c, i) => {
      const aiLabel = c.aiScore?.label || 'neutral';
      const card = document.createElement('div');
      card.className            = `comment-card ${aiLabel} anim-fadeInUp`;
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
      dateSpan.textContent = new Date(c.createdAt).toLocaleDateString(
        lang === 'tr' ? 'tr-TR' : 'en-US'
      );

      header.appendChild(starsSpan);
      header.appendChild(badge);
      header.appendChild(dateSpan);

      const p = document.createElement('p');
      p.textContent = c.comment;

      card.appendChild(header);
      card.appendChild(p);
      list.appendChild(card);
    });

    renderPomPagination(data.pagination);
  } catch {
    list.innerHTML = `<p class="muted" style="color:var(--danger)">${t('pomLoadErr')}</p>`;
  }
}

function renderPomPagination(pagination) {
  const el = document.getElementById('pom-pagination');
  if (pagination.pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = '';
  for (let i = 1; i <= pagination.pages; i++) {
    const btn = document.createElement('button');
    btn.className   = `page-btn ${i === pomPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => goPage(i));
    el.appendChild(btn);
  }
}

function goPage(page) {
  pomPage = page;
  loadPomComments();
}

function showEmpty() {
  const card     = document.getElementById('pom-card');
  const emptyDiv = document.createElement('div');
  emptyDiv.className        = 'pom-empty';
  emptyDiv.style.gridColumn = '1/-1';

  const icon = document.createElement('div');
  icon.className   = 'pom-empty-icon';
  icon.textContent = '🏆';

  const h2 = document.createElement('h2');
  h2.textContent = t('pomEmptyTitle');

  const p = document.createElement('p');
  p.textContent = t('pomEmptyDesc');

  emptyDiv.appendChild(icon);
  emptyDiv.appendChild(h2);
  emptyDiv.appendChild(p);
  card.innerHTML = '';
  card.appendChild(emptyDiv);

  document.getElementById('pom-title').textContent  = t('pomBadge');
  document.getElementById('pom-period').textContent = getCurrentMonthLabel();
}

function getCurrentMonthLabel() {
  const lang = localStorage.getItem('lang') || 'en';
  return new Date().toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );
}

function getLastMonthLabel() {
  const lang = localStorage.getItem('lang') || 'en';
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { month: 'long', year: 'numeric' }
  ) + ` (${t('pomLastMonth')})`;
}
