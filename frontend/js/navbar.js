document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('userToken');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  const usernameEl = document.getElementById('nav-username');
  if (usernameEl) usernameEl.textContent = user.username;

  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.addEventListener('click', toggleLang);

  const favLink = document.getElementById('nav-favorites');
  if (favLink) {
    favLink.addEventListener('click', (e) => {
      e.preventDefault();
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const navUser   = document.getElementById('nav-user');
  const dropdown  = navUser?.querySelector('.nav-dropdown');

  if (navUser && dropdown) {
    navUser.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
});
