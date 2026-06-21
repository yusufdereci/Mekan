const BASE_URL = CONFIG.BASE_URL;

const publicFetch = async (url) => {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${BASE_URL}${url}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    if (!navigator.onLine)        throw new Error('Please check your internet connection.');
    throw err;
  }
};

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('userToken');

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (res.status === 401) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      if (typeof showToast === 'function') {
        showToast('Your session has expired. Please log in again.', 'warning', 4000);
      }
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      return null;
    }

    return res.json();

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    if (!navigator.onLine)        throw new Error('Please check your internet connection.');
    console.error(`[API] Fetch error: ${url}`, err);
    throw err;
  }
};

const API = {
  getComments:  (placeId, page = 1, limit = 5) => publicFetch(`/comments/${placeId}?page=${page}&limit=${limit}`),
  getStats:     (placeId)                       => publicFetch(`/stats/${placeId}`),
  getRanking:   (placeIds)                      => publicFetch(`/stats/ranking?placeIds=${placeIds.join(',')}`),
  getTrending:  (limit = 5)                     => publicFetch(`/stats/trending?limit=${limit}`),
  postComment:  (data)                          => authFetch('/comments', { method: 'POST', body: JSON.stringify(data) }),
};
