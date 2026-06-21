const API_URL = CONFIG.BASE_URL;

if (localStorage.getItem('userToken')) {
  window.location.href = 'home.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('register-btn');
  const errorMsg    = document.getElementById('error-msg');

  registerBtn.addEventListener('click', handleRegister);
  document.getElementById('password-confirm').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });

  async function handleRegister() {
    const username        = document.getElementById('username').value.trim();
    const email           = document.getElementById('email').value.trim();
    const password        = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    if (!username || !email || !password || !passwordConfirm) {
      showError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      showError('Passwords do not match.');
      return;
    }

    registerBtn.disabled    = true;
    registerBtn.textContent = 'Creating account...';
    errorMsg.classList.add('hidden');

    try {
      const res  = await fetch(`${API_URL}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (!data.success) {
        showError(data.message || 'Registration failed.');
        return;
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = 'home.html';
    } catch {
      showError('Could not connect to the server.');
    } finally {
      registerBtn.disabled    = false;
      registerBtn.textContent = 'Sign Up';
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }
});
