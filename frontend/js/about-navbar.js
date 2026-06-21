document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('userToken');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && user) {
    const usernameEl = document.getElementById('nav-username');
    if (usernameEl) usernameEl.textContent = user.username;

    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    }

  } else {
    const navUser  = document.getElementById('nav-user');
    const navGuest = document.getElementById('nav-guest');
    if (navUser)  navUser.classList.add('hidden');
    if (navGuest) navGuest.classList.remove('hidden');
  }

  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      if (typeof toggleLang === 'function') toggleLang();
    });
  }
});