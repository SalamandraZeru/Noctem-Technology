// Runs synchronously in <head>, before first paint. Kept as a file (not inline) so the
// Content-Security-Policy can use script-src 'self' without 'unsafe-inline'.
(() => {
  try {
    const navigation = performance.getEntriesByType('navigation')[0];
    const isReload = navigation && 'type' in navigation && navigation.type === 'reload';
    if (sessionStorage.getItem('noctem-intro-seen') === '1' && !isReload) {
      document.documentElement.dataset.introSeen = 'true';
    }
    const path = location.pathname;
    if ((path === '/' || path === '/index.html') && !localStorage.getItem('noctem-language-choice') && !sessionStorage.getItem('noctem-language-detected')) {
      sessionStorage.setItem('noctem-language-detected', '1');
      const preferred = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
      if (preferred.startsWith('en')) location.replace('/en/');
    }
  } catch {}
})();
