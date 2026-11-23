// About page interactions (I-29 portrait spotlight, I-31 skill chips, I-32 experience rows)
// Loaded dynamically only on /about.
import { isReducedMotion, isFinePointer } from './context';
import { isFeatureDisabled } from '../debug/features';

let aboutCleanup: (() => void) | null = null;

export function cleanupAboutPage(): void {
  if (aboutCleanup) {
    aboutCleanup();
    aboutCleanup = null;
  }
}

export function initAboutPage(): void {
  if (typeof document === 'undefined') return;

  const wrapper = document.querySelector<HTMLElement>('.about-portrait-wrapper[data-spotlight]');
  if (!wrapper || wrapper.dataset['aboutInitialized'] === 'true') {
    return;
  }

  cleanupAboutPage();
  wrapper.dataset['aboutInitialized'] = 'true';

  const cleanups: Array<() => void> = [];

  // 1. Portrait spotlight (I-29)
  if (isFinePointer() && !isReducedMotion() && !isFeatureDisabled('spotlight')) {
    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      wrapper.style.setProperty('--spotlight-x', `${x.toFixed(1)}%`);
      wrapper.style.setProperty('--spotlight-y', `${y.toFixed(1)}%`);
    };

    const handlePointerLeave = () => {
      wrapper.style.setProperty('--spotlight-x', '50%');
      wrapper.style.setProperty('--spotlight-y', '50%');
    };

    wrapper.addEventListener('pointermove', handlePointerMove as EventListener, { passive: true });
    wrapper.addEventListener('mousemove', handlePointerMove as EventListener, { passive: true });
    wrapper.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    wrapper.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    cleanups.push(() => {
      wrapper.removeEventListener('pointermove', handlePointerMove as EventListener);
      wrapper.removeEventListener('mousemove', handlePointerMove as EventListener);
      wrapper.removeEventListener('pointerleave', handlePointerLeave);
      wrapper.removeEventListener('mouseleave', handlePointerLeave);
      wrapper.style.removeProperty('--spotlight-x');
      wrapper.style.removeProperty('--spotlight-y');
    });
  }

  aboutCleanup = () => {
    cleanups.forEach((c) => c());
    cleanups.length = 0;
    delete wrapper.dataset['aboutInitialized'];
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', cleanupAboutPage);
}
