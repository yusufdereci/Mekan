let translations = {};
let currentLang  = localStorage.getItem('lang') || 'tr';
let onLangReady  = null;

async function loadTranslations(lang) {
  try {
    const res = await fetch(`${lang}.json`);
    translations = await res.json();
    applyTranslations();
    if (typeof onLangReady === 'function') onLangReady();
  } catch {
    console.error('Failed to load language file:', lang);
  }
}

function t(key) {
  return translations[key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[key]) el.textContent = translations[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[key]) el.placeholder = translations[key];
  });

  const searchInput = document.getElementById('search-input');
  const locateBtn   = document.getElementById('locate-btn');
  const submitBtn   = document.getElementById('submit-comment-btn');
  const langBtn     = document.getElementById('lang-btn');

  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  if (locateBtn)   locateBtn.textContent   = t('locateBtn');
  if (submitBtn)   submitBtn.textContent   = t('sendBtn');
  if (langBtn)     langBtn.textContent     = currentLang === 'tr' ? 'EN' : 'TR';
}

function toggleLang() {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  localStorage.setItem('lang', currentLang);
  loadTranslations(currentLang);
}

document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLang);
});
