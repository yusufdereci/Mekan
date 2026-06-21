const FAVORITES_KEY = 'mekan_favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function isFavorite(placeId) {
  return getFavorites().some(f => f.placeId === placeId);
}

function toggleFavorite(place) {
  const favs = getFavorites();
  const idx  = favs.findIndex(f => f.placeId === place.placeId);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(place);
  }
  saveFavorites(favs);
  renderFavorites();
  return idx < 0;
}

function renderFavorites() {
  const list = document.getElementById('favorites-list');
  const favs = getFavorites();

  if (favs.length === 0) {
    list.innerHTML = `<p class="muted">${t('noFavorites')}</p>`;
    return;
  }

  list.innerHTML = '';
  favs.forEach(f => {
    const card = document.createElement('div');
    card.className = 'mini-card';

    const nameEl = document.createElement('div');
    nameEl.className   = 'mini-card-name';
    nameEl.textContent = f.placeName;

    const metaEl = document.createElement('div');
    metaEl.className   = 'mini-card-meta';
    metaEl.textContent = f.placeAddress || '';

    card.appendChild(nameEl);
    card.appendChild(metaEl);
    card.addEventListener('click', () => openPlacePanel({
      placeId:   f.placeId,
      placeName: f.placeName,
      address:   f.placeAddress || ''
    }));

    list.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderFavorites);
