// Single global ticker driving GSAP and Lenis per docs/02-engineering/animation-implementation.md.
// No competing requestAnimationFrame loops.
import { gsap } from 'gsap';
import { getLenis } from './lenis';

let tickerStarted = false;

export function initTicker(): void {
  if (tickerStarted || typeof window === 'undefined') return;
  tickerStarted = true;

  // Disable GSAP lag smoothing so scroll and tweens stay in exact synchronization
  gsap.ticker.lagSmoothing(0);

  gsap.ticker.add((time: number) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.raf(time * 1000);
    }
  });
}
