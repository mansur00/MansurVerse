// Runs before first paint (inlined by BaseLayout). With no stored choice the CSS follows the system preference.
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    var storedMotion = localStorage.getItem('motion');
    if (
      storedMotion === 'reduced' ||
      (!storedMotion &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      document.documentElement.setAttribute('data-motion', 'reduced');
    } else if (storedMotion === 'normal') {
      document.documentElement.setAttribute('data-motion', 'normal');
    }
  } catch {
    // Storage unavailable: the site still works with system defaults.
  }
})();
