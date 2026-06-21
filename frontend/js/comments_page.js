const BASE_URL = CONFIG.BASE_URL;

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return t('timeJustNow');
  if (m < 60) return `${m} ${t('timeMinutes')}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${t('timeHours')}`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ${t('timeDays')}`;
  const lang = localStorage.getItem('lang') || 'en';
  return new Date(dateStr).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US');
};

const sentimentLabel = (label) => {
  if (label === 'positive') return { text: t('positive'), cls: 'positive' };
  if (label === 'negative') return { text: t('negative'), cls: 'negative' };
  return { text: t('neutral'), cls: 'neutral' };
};

const ANON_EMOJIS   = ['🦊','🐻','🦁','🐯','🐧','🦋','🌿','🍀','⛵','🎭','🗺️','🧭'];
const ANON_NAMES_TR = ['Gezgin','Kaşif','Yolcu','Ziyaretçi','Meraklı','Seyyah','Maceraperest','Keşifçi'];
const ANON_NAMES_EN = ['Traveler','Explorer','Visitor','Wanderer','Curious','Voyager','Adventurer','Scout'];

const getAnonName = (id) => {
  const lang  = localStorage.getItem('lang') || 'en';
  const names = lang === 'tr' ? ANON_NAMES_TR : ANON_NAMES_EN;
  const hash  = id ? parseInt(id.slice(-4), 16) : Math.random() * 1000;
  const emoji = ANON_EMOJIS[hash % ANON_EMOJIS.length];
  const name  = names[Math.floor(hash / ANON_EMOJIS.length) % names.length];
  return `${emoji} ${t('anon')} ${name}`;
};

const buildCard = (c) => {
  const sent     = sentimentLabel(c.aiScore?.label);
  const anonName = getAnonName(c._id);

  const card = document.createElement('div');
  card.className = `feed-card ${sent.cls}`;

  const top = document.createElement('div');
  top.className = 'feed-card-top';

  const placeSpan = document.createElement('span');
  placeSpan.className         = 'feed-card-place';
  placeSpan.dataset.placeId   = c.placeId;
  placeSpan.dataset.placeName = c.placeName;
  placeSpan.textContent       = `📍 ${c.placeName}`;

  const metaDiv = document.createElement('div');
  metaDiv.className = 'feed-card-meta';

  const starsSpan = document.createElement('span');
  starsSpan.className   = 'feed-card-stars';
  starsSpan.textContent = stars(c.rating);

  const sentBadge = document.createElement('span');
  sentBadge.className   = `sentiment-badge ${sent.cls}`;
  sentBadge.textContent = sent.text;

  metaDiv.appendChild(starsSpan);
  metaDiv.appendChild(sentBadge);
  top.appendChild(placeSpan);
  top.appendChild(metaDiv);

  const p = document.createElement('p');
  p.className   = 'feed-card-text';
  p.textContent = c.comment;

  const bottom = document.createElement('div');
  bottom.className = 'feed-card-bottom';

  const anonSpan = document.createElement('span');
  anonSpan.className   = 'feed-card-anon';
  anonSpan.textContent = anonName;

  const rightDiv = document.createElement('div');
  rightDiv.style.cssText = 'display:flex;align-items:center;gap:10px';

  const dateSpan = document.createElement('span');
  dateSpan.className   = 'feed-card-date';
  dateSpan.textContent = timeAgo(c.createdAt);
  rightDiv.appendChild(dateSpan);

  if (c.aiScore?.satisfactionScore != null) {
    const scoreSpan  = document.createElement('span');
    scoreSpan.className   = 'feed-card-score';
    scoreSpan.textContent = 'AI: ';
    const scoreInner = document.createElement('span');
    scoreInner.textContent = `${c.aiScore.satisfactionScore}%`;
    scoreSpan.appendChild(scoreInner);
    rightDiv.appendChild(scoreSpan);
  }

  bottom.appendChild(anonSpan);
  bottom.appendChild(rightDiv);
  card.appendChild(top);
  card.appendChild(p);
  card.appendChild(bottom);
  return card;
};

const buildPagination = (container, pagination, onPage) => {
  container.innerHTML = '';
  if (pagination.pages <= 1) return;
  for (let i = 1; i <= pagination.pages; i++) {
    const btn = document.createElement('button');
    btn.className   = 'page-btn' + (i === pagination.page ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => onPage(i));
    container.appendChild(btn);
  }
};

const feedList       = document.getElementById('feed-list');
const feedPagination = document.getElementById('feed-pagination');
const feedTotal      = document.getElementById('feed-total');

let currentFeedPage  = 1;
let currentPlaceId   = null;
let currentPlaceName = null;
let currentPlacePage = 1;

const loadFeed = async (page = 1) => {
  currentFeedPage = page;
  feedList.innerHTML = `
    <div class="comment-card-skeleton skeleton"></div>
    <div class="comment-card-skeleton skeleton"></div>
    <div class="comment-card-skeleton skeleton"></div>
  `;

  const res = await fetch(`${BASE_URL}/comments?page=${page}&limit=8`).then(r => r.json());
  if (!res.success) return;

  feedTotal.textContent = `${res.pagination.total} ${t('feedReviewCount')}`;

  if (res.data.length) {
    feedList.innerHTML = '';
    res.data.forEach(c => feedList.appendChild(buildCard(c)));
  } else {
    feedList.innerHTML = `<p style="color:var(--muted);text-align:center;padding:2rem">${t('feedNoReviews')}</p>`;
  }

  feedList.querySelectorAll('.feed-card-place').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('place-search-input').value = el.dataset.placeName;
      loadPlaceComments(el.dataset.placeId, el.dataset.placeName);
    });
  });

  buildPagination(feedPagination, res.pagination, loadFeed);
};

const placeResult      = document.getElementById('place-result');
const placeEmpty       = document.getElementById('place-empty');
const placeList        = document.getElementById('place-comments-list');
const placePagination  = document.getElementById('place-pagination');
const placeResultName  = document.getElementById('place-result-name');
const placeResultCount = document.getElementById('place-result-count');

const loadPlaceComments = async (placeId, placeName, page = 1) => {
  currentPlaceId   = placeId;
  currentPlaceName = placeName;
  currentPlacePage = page;

  placeResult.classList.remove('hidden');
  placeEmpty.classList.add('hidden');
  placeResultName.textContent  = `📍 ${placeName}`;
  placeResultCount.textContent = t('placeLoading');

  placeList.innerHTML = `
    <div class="comment-card-skeleton skeleton"></div>
    <div class="comment-card-skeleton skeleton"></div>
  `;

  const res = await fetch(`${BASE_URL}/comments/${encodeURIComponent(placeId)}?page=${page}&limit=8`)
    .then(r => r.json());

  if (!res.success) return;

  placeResultCount.textContent = `${res.pagination.total} ${t('feedReviewCount')}`;

  if (res.data.length) {
    placeList.innerHTML = '';
    res.data.forEach(c => placeList.appendChild(buildCard(c)));
  } else {
    placeList.innerHTML = `<p style="color:var(--muted);text-align:center;padding:2rem">${t('placeNoReviews')}</p>`;
  }

  buildPagination(placePagination, res.pagination, (p) => loadPlaceComments(placeId, placeName, p));
};

document.getElementById('place-search-btn').addEventListener('click', () => {
  const val = document.getElementById('place-search-input').value.trim();
  if (!val) return;
  loadPlaceComments(val, val);
});

document.getElementById('place-search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('place-search-btn').click();
});

onLangReady = () => {
  loadFeed(currentFeedPage);
  if (currentPlaceId) {
    loadPlaceComments(currentPlaceId, currentPlaceName, currentPlacePage);
  }
};
