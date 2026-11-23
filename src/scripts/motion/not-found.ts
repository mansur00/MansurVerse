// 404 page distortion interaction (I-35)
// Loaded dynamically only on /404.
import { initRepel } from './repel';

let notFoundCleanup: (() => void) | null = null;

export function cleanupNotFoundPage(): void {
  if (notFoundCleanup) {
    notFoundCleanup();
    notFoundCleanup = null;
  }
}

export function initNotFoundPage(): void {
  if (typeof document === 'undefined') return;

  const heading = document.querySelector<HTMLElement>('.not-found-title');
  if (!heading || heading.dataset['repelInitialized'] === 'true') {
    return;
  }

  cleanupNotFoundPage();
  heading.dataset['repelInitialized'] = 'true';

  const cancel = initRepel(heading, 'distortion');
  notFoundCleanup = () => {
    cancel();
    delete heading.dataset['repelInitialized'];
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', cleanupNotFoundPage);
}
