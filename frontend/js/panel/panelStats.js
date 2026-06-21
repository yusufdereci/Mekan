async function loadPlaceStats(placeId) {
  showStatsSkeleton();

  try {
    const data = await API.getStats(placeId);
    if (!data.success) return;

    const s = data.data;

    const pct = s.satisfactionPct;
    const satEl = document.getElementById('stat-satisfaction');
    satEl.textContent = pct !== null ? `${pct}%` : '—';
    satEl.className   = 'stat-val ' + getMoodClass(pct);

    document.getElementById('stat-rating').textContent =
      s.avgRating !== null ? `${s.avgRating} ★` : '—';
    document.getElementById('stat-total').textContent = s.totalReviews;

    updateCharts(s);
  } catch {
    showToast('Failed to load stats.', 'error');
  }
}

function showStatsSkeleton() {
  document.getElementById('stat-satisfaction').textContent = '...';
  document.getElementById('stat-rating').textContent       = '...';
  document.getElementById('stat-total').textContent        = '...';
}

function getMoodClass(pct) {
  if (pct === null) return '';
  if (pct >= 80)   return 'mood-great';
  if (pct >= 60)   return 'mood-good';
  if (pct >= 40)   return 'mood-neutral';
  if (pct >= 20)   return 'mood-bad';
  return 'mood-terrible';
}
