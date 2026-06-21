async function handleSearch() {
  const query  = document.getElementById('search-input').value.trim();
  if (!query) return;

  const center = map.getCenter();

  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&countrycodes=tr&viewbox=${center.lng - 0.5},${center.lat + 0.5},${center.lng + 0.5},${center.lat - 0.5}&bounded=1`,
      { headers: { 'Accept-Language': 'tr', 'User-Agent': 'MekanApp/1.0' } }
    );
    const data = await res.json();

    if (!data.length) { alert('No results found.'); return; }

    clearMarkers();

    data.forEach(place => {
      addMarker({
        lat:     parseFloat(place.lat),
        lng:     parseFloat(place.lon),
        name:    place.display_name.split(',')[0],
        addr:    place.display_name.split(',').slice(1, 3).join(',').trim(),
        placeId: `osm_${place.osm_id}`
      });
    });

    map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15);
    updateRanking(data.map(p => `osm_${p.osm_id}`));

  } catch {
    alert('Search failed. Please check your internet connection.');
  }
}

async function searchNearby() {
  const center = map.getCenter();

  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=cafe+restaurant&format=json&limit=20&addressdetails=1&countrycodes=tr&viewbox=${center.lng - 0.05},${center.lat + 0.05},${center.lng + 0.05},${center.lat - 0.05}&bounded=1`,
      { headers: { 'Accept-Language': 'tr', 'User-Agent': 'MekanApp/1.0' } }
    );
    const data = await res.json();
    if (!data.length) return;

    clearMarkers();

    data.forEach(place => {
      addMarker({
        lat:     parseFloat(place.lat),
        lng:     parseFloat(place.lon),
        name:    place.display_name.split(',')[0],
        addr:    place.display_name.split(',').slice(1, 3).join(',').trim(),
        placeId: `osm_${place.osm_id}`
      });
    });

    updateRanking(data.map(p => `osm_${p.osm_id}`));
  } catch { }
}
