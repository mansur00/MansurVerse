// Theme management (I-01) per docs/01-design/interaction-motion.md.
// Circular reveal via View Transitions where supported, 200ms colour fade otherwise, instant under reduced motion.
import { isReducedMotion } from './motion/context';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function currentTheme(): Theme {
  const set = document.documentElement.dataset['theme'];
  if (set === 'light' || set === 'dark') return set;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the choice applies to this visit only.
  }
}

export function toggleThemeWithReveal(button?: HTMLElement | null): void {
  if (typeof document === 'undefined') return;

  const nextTheme: Theme = currentTheme() === 'dark' ? 'light' : 'dark';

  // 1. Instant under reduced motion
  if (isReducedMotion()) {
    setTheme(nextTheme);
    return;
  }

  // 2. View Transitions circular reveal where supported
  if (document.startViewTransition) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (button) {
      const rect = button.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.classList.add('is-theme-reveal');

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready
      .then(() => {
        const anim = document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
        anim.onfinish = () => {
          document.documentElement.classList.remove('is-theme-reveal');
        };
      })
      .catch(() => {
        document.documentElement.classList.remove('is-theme-reveal');
      });
    return;
  }

  // 3. 200ms colour fade fallback when startViewTransition is unsupported
  document.documentElement.classList.add('is-theme-fading');
  setTheme(nextTheme);
  setTimeout(() => {
    document.documentElement.classList.remove('is-theme-fading');
  }, 200);
}

export function initThemeToggle(button: HTMLButtonElement): void {
  button.addEventListener('click', () => toggleThemeWithReveal(button));
}
