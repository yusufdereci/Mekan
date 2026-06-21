document.addEventListener('DOMContentLoaded', async () => {
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  document.body.appendChild(toastContainer);

  initMap();
  initCharts();
  loadTrending();
  renderFavorites();

  const pomSearch = localStorage.getItem('pomSearch');
  if (pomSearch) {
    localStorage.removeItem('pomSearch');
    setTimeout(() => {
      const input = document.getElementById('search-input');
      input.value = pomSearch;
      handleSearch();
    }, 800);
  }
});

async function loadTrending() {
  const list = document.getElementById('trending-list');

  list.innerHTML = `
    <div class="skeleton skeleton-line full"></div>
    <div class="skeleton skeleton-line medium"></div>
    <div class="skeleton skeleton-line short"></div>
  `;

  try {
    const data = await API.getTrending(5);

    if (!data.success || data.data.length === 0) {
      list.innerHTML = '<p class="muted">No trending places found.</p>';
      return;
    }

    list.innerHTML = '';

    data.data.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'mini-card anim-fadeInUp';
      card.style.animationDelay = `${i * 0.08}s`;

      const nameEl = document.createElement('div');
      nameEl.className   = 'mini-card-name';
      nameEl.textContent = p.placeName;

      const metaEl = document.createElement('div');
      metaEl.className   = 'mini-card-meta';
      metaEl.textContent = `🔥 ${p.positiveCount} positive · ⭐ ${p.avgRating}`;

      card.appendChild(nameEl);
      card.appendChild(metaEl);

      card.addEventListener('click', () => {
        openPlacePanel({
          placeId:   p.placeId,
          placeName: p.placeName,
          address:   ''
        });
      });

      list.appendChild(card);
    });

  } catch {
    list.innerHTML = '<p class="muted">Failed to load.</p>';
  }
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className   = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
