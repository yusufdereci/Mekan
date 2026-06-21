async function updateRanking(placeIds) {
  if (!placeIds || placeIds.length === 0) return;

  const list = document.getElementById('ranking-list');
  list.innerHTML = `
    <div class="skeleton skeleton-line full"></div>
    <div class="skeleton skeleton-line medium"></div>
    <div class="skeleton skeleton-line short"></div>
  `;

  try {
    const data = await API.getRanking(placeIds);

    if (!data.success || data.data.length === 0) {
      list.innerHTML = `<p class="muted">${t('noRanking')}</p>`;
      return;
    }

    list.innerHTML = '';
    data.data.forEach((p, i) => {
      const moodClass = getMoodClass(p.satisfactionPct);
      const item = document.createElement('div');
      item.className = 'ranking-item anim-fadeInUp';
      item.style.animationDelay = `${i * 0.05}s`;

      const header = document.createElement('div');
      header.className = 'ranking-item-header';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'ranking-name';
      nameSpan.textContent = `${getRankEmoji(i)} ${p.placeName}`;

      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'ranking-score';
      scoreSpan.textContent = p.satisfactionPct !== null ? `${p.satisfactionPct}%` : '—';

      header.appendChild(nameSpan);
      header.appendChild(scoreSpan);

      const meta = document.createElement('div');
      meta.className = 'ranking-meta';
      meta.textContent = `⭐ ${p.avgRating ?? '—'} · ${p.totalReviews} reviews`;

      const bar = document.createElement('div');
      bar.className = 'ranking-bar';
      const fill = document.createElement('div');
      fill.className = `ranking-bar-fill ${moodClass}`;
      fill.style.width = `${p.satisfactionPct ?? 0}%`;
      bar.appendChild(fill);

      item.appendChild(header);
      item.appendChild(meta);
      item.appendChild(bar);

      item.addEventListener('click', () => openPlacePanel({
        placeId:   p.placeId,
        placeName: p.placeName,
        address:   ''
      }));

      list.appendChild(item);
    });

  } catch {
    list.innerHTML = `<p class="muted">${t('noRanking')}</p>`;
  }
}

function getRankEmoji(i) {
  return ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
}
