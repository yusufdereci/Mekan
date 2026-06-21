let currentPlace = null;

function openPlacePanel(place) {
  currentPlace = place;

  document.getElementById('place-name').textContent    = place.placeName;
  document.getElementById('place-address').textContent = place.address || '';
  document.getElementById('stat-satisfaction').textContent = '—';
  document.getElementById('stat-rating').textContent       = '—';
  document.getElementById('stat-total').textContent        = '—';

  const favBtn = document.getElementById('favorite-btn');
  favBtn.classList.toggle('active', isFavorite(place.placeId));

  const panel = document.getElementById('place-panel');
  panel.classList.remove('hidden');
  panel.classList.add('anim-slideUp');

  setTimeout(() => panel.classList.remove('anim-slideUp'), 400);

  loadPlaceStats(place.placeId);
  initComments(place.placeId, place.placeName);
}

function closePanel() {
  const panel = document.getElementById('place-panel');
  panel.classList.add('hidden');
  currentPlace = null;
}

function handleFavorite() {
  if (!currentPlace) return;
  const added = toggleFavorite({
    placeId:      currentPlace.placeId,
    placeName:    currentPlace.placeName,
    placeAddress: currentPlace.address || ''
  });
  document.getElementById('favorite-btn').classList.toggle('active', added);
  showToast(added ? '⭐ Added to favorites' : 'Removed from favorites', added ? 'success' : 'info');
}
