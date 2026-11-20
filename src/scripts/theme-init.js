// Runs before first paint (inlined by BaseLayout). With no stored choice the CSS follows the system preference.
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
    if (localStorage.getItem('motion') === 'reduced') document.documentElement.setAttribute('data-motion', 'reduced');
  } catch (error) {
    // Storage unavailable: the site still works with system defaults.
  }
})();
