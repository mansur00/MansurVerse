// Nav hide and show on scroll direction (I-02) per docs/01-design/interaction-motion.md.
// Hides past 120px scrolling down; returns on scroll up, at the top, when focus is inside, or when menu is open.
import { isReducedMotion } from './context';

let lastScrollY = 0;
let isMenuOpen = false;
let scrollListener: (() => void) | null = null;
let focusListener: (() => void) | null = null;

export function setNavMenuOpenState(open: boolean): void {
  isMenuOpen = open;
  const nav = document.querySelector<HTMLElement>('.nav-header');
  if (nav && open) {
    nav.classList.remove('is-hidden');
  }
}

export function initNavScroll(): void {
  if (typeof window === 'undefined') return;

  const nav = document.querySelector<HTMLElement>('.nav-header');
  if (!nav) return;

  lastScrollY = Math.max(0, window.scrollY);

  scrollListener = () => {
    const currentScrollY = Math.max(0, window.scrollY);

    if (isReducedMotion()) {
      nav.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (isMenuOpen || nav.contains(document.activeElement)) {
      nav.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY <= 0) {
      nav.classList.remove('is-hidden');
    } else if (currentScrollY > 120 && currentScrollY > lastScrollY) {
      nav.classList.add('is-hidden');
    } else if (currentScrollY < lastScrollY) {
      nav.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
  };

  focusListener = () => {
    nav.classList.remove('is-hidden');
  };

  window.addEventListener('scroll', scrollListener, { passive: true });
  nav.addEventListener('focusin', focusListener);
}

export function cleanupNavScroll(): void {
  if (typeof window === 'undefined') return;

  const nav = document.querySelector<HTMLElement>('.nav-header');
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener);
    scrollListener = null;
  }
  if (focusListener && nav) {
    nav.removeEventListener('focusin', focusListener);
    focusListener = null;
  }
}
