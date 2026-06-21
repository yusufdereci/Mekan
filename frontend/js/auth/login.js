const API_URL = CONFIG.BASE_URL;

if (localStorage.getItem('userToken')) {
  window.location.href = 'home.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const errorMsg = document.getElementById('error-msg');

  loginBtn.addEventListener('click', handleLogin);
  document.getElementById('password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  async function handleLogin() {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Email and password are required.');
      return;
    }

    loginBtn.disabled     = true;
    loginBtn.textContent  = 'Signing in...';
    errorMsg.classList.add('hidden');

    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!data.success) {
        showError(data.message || 'Login failed.');
        return;
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = 'home.html';
    } catch {
      showError('Could not connect to the server.');
    } finally {
      loginBtn.disabled    = false;
      loginBtn.textContent = 'Sign In';
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }
});
