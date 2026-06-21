const CONFIG = (() => {
  if (window.APP_CONFIG?.BASE_URL) return { BASE_URL: window.APP_CONFIG.BASE_URL };
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) return { BASE_URL: '/api' };
  return { BASE_URL: 'http://localhost:5000/api' };
})();
