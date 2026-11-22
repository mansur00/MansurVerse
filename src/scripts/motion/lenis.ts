// Smooth scroll implementation (I-07) with Lenis.
// Never active under reduced motion. Single global ticker synchronization with GSAP.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion, MOTION_CHANGE_EVENT } from './context';
import { isFeatureDisabled } from '../debug/features';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let isStoppedForMenu = false;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Initializes Lenis smooth scrolling if motion is not reduced.
 */
export function initLenis(): Lenis | null {
  if (typeof window === 'undefined') return null;

  if (isFeatureDisabled('lenis')) return null;

  if (isReducedMotion()) {
    destroyLenis();
    return null;
  }

  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    lerp: 0.1, // ~1.1s smooth response
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false, // Driven strictly by GSAP ticker in ticker.ts
  });

  lenisInstance.on('scroll', () => {
    ScrollTrigger.update();
  });

  if (isStoppedForMenu) {
    lenisInstance.stop();
  }

  return lenisInstance;
}

/**
 * Pauses Lenis (e.g. while mobile menu overlay is open).
 */
export function stopLenis(): void {
  isStoppedForMenu = true;
  lenisInstance?.stop();
}

/**
 * Resumes Lenis after mobile menu overlay is closed.
 */
export function startLenis(): void {
  isStoppedForMenu = false;
  lenisInstance?.start();
}

/**
 * Tears down Lenis instance completely.
 */
export function destroyLenis(): void {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

// React to motion changes in real-time
if (typeof window !== 'undefined') {
  window.addEventListener(MOTION_CHANGE_EVENT, (event: Event) => {
    const custom = event as CustomEvent<{ reduced: boolean }>;
    if (custom.detail?.reduced) {
      destroyLenis();
    } else {
      initLenis();
    }
  });
}
