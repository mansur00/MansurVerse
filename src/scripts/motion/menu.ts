// Mobile MenuOverlay behaviour (I-03 behaviour only) per docs/01-design/interaction-motion.md.
// Opens and closes, traps focus, closes with Esc and returns focus to trigger. No letter-roll yet.
import { stopLenis, startLenis } from './lenis';
import { setNavMenuOpenState } from './nav';

let openButton: HTMLButtonElement | null = null;
let closeButton: HTMLButtonElement | null = null;
let overlay: HTMLElement | null = null;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function openMenu(): void {
  if (!overlay) return;

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');

  if (openButton) {
    openButton.setAttribute('aria-expanded', 'true');
  }

  // Prevent background scrolling and stop smooth scroll
  document.documentElement.style.overflow = 'hidden';
  stopLenis();
  setNavMenuOpenState(true);

  // Focus the close button or first interactive element inside overlay
  if (closeButton) {
    closeButton.focus();
  } else {
    const focusables = overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables.length > 0) {
      focusables[0]?.focus();
    }
  }
}

export function closeMenu(): void {
  if (!overlay) return;

  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');

  if (openButton) {
    openButton.setAttribute('aria-expanded', 'false');
  }

  // Restore background scrolling and smooth scroll
  document.documentElement.style.overflow = '';
  startLenis();
  setNavMenuOpenState(false);

  // Return focus to the trigger button
  if (openButton) {
    openButton.focus();
  }
}

export function isMenuOpen(): boolean {
  return overlay?.classList.contains('is-open') ?? false;
}

export function initMenuOverlay(): void {
  if (typeof window === 'undefined') return;

  openButton = document.querySelector<HTMLButtonElement>('#menu-open-button');
  overlay = document.querySelector<HTMLElement>('#menu-overlay');
  closeButton = overlay?.querySelector<HTMLButtonElement>('#menu-close') ?? null;

  if (!openButton || !overlay) return;

  openButton.setAttribute('aria-expanded', 'false');
  overlay.setAttribute('aria-hidden', 'true');

  openButton.addEventListener('click', () => {
    openMenu();
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeMenu();
    });
  }

  // Close when clicking any link in the menu (for smooth navigation)
  overlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Focus trap & Escape key handler
  keyHandler = (e: KeyboardEvent) => {
    if (!isMenuOpen() || !overlay) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
  };

  window.addEventListener('keydown', keyHandler);
}

export function cleanupMenuOverlay(): void {
  if (keyHandler) {
    window.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }
  if (isMenuOpen()) {
    closeMenu();
  }
}
