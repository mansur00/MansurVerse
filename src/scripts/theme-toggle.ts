type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function currentTheme(): Theme {
  const set = document.documentElement.dataset['theme'];
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the choice applies to this visit only.
  }
}

export function initThemeToggle(button: HTMLButtonElement): void {
  button.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
}
