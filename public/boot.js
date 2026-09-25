// Runs synchronously in <head>, before first paint. Kept as a file (not inline) so the
// Content-Security-Policy can use script-src 'self' without 'unsafe-inline'.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('motion');
  // Modest hardware or data saver: keep the look, drop the most expensive per-frame effects.
  const connection = navigator.connection;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  if (cores <= 2 || memory <= 2 || (cores <= 4 && memory <= 4) || (connection && connection.saveData)) root.classList.add('lite');
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
