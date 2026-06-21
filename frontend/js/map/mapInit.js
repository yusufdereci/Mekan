let map = null;
let searchTimeout = null;

function initMap() {
  map = L.map('map', { zoomControl: true }).setView([41.0082, 28.9784], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  map.on('moveend', () => {
    if (map.getZoom() < 16) return;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchNearby, 5000);
  });

  document.getElementById('locate-btn').addEventListener('click', locateUser);
  document.getElementById('search-btn').addEventListener('click', handleSearch);
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });
  document.getElementById('close-panel-btn').addEventListener('click', closePanel);
  document.getElementById('favorite-btn').addEventListener('click', handleFavorite);
}

function locateUser() {
  if (!navigator.geolocation) { alert('Your browser does not support geolocation.'); return; }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    map.setView([lat, lng], 15);

    L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#4ecca3',
      fillOpacity: 1,
      color: '#fff',
      weight: 2
    }).addTo(map).bindTooltip('Your location', { permanent: false });

    searchNearby();
  }, () => {
    alert('Could not get location. Please allow location access.');
  });
}
