let markers = [];

function addMarker(place) {
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      background:#6c63ff;
      border:2px solid #fff;
      border-radius:50%;
      box-shadow:0 0 6px rgba(108,99,255,0.6)
    "></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7]
  });

  const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);

  marker.on('click', () => {
    openPlacePanel({
      placeId:   place.placeId,
      placeName: place.name,
      address:   place.addr
    });
  });

  marker.bindTooltip(place.name, {
    permanent:  false,
    direction:  'top',
    className:  'map-tooltip'
  });

  markers.push(marker);
}

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}
