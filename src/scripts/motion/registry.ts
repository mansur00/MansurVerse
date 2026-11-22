// Motion lifecycle registry per docs/02-engineering/animation-implementation.md.
// Modules register init and cleanup functions. Lifecycle coordinates with Astro route transitions.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getMotionContext, type MotionContext } from './context';

import { revealModule } from './reveal';
import { scrubModule } from './scrub';
import { counterModule } from './counter';
import { marqueeModule } from './marquee';
import { capabilityModule } from './capability';
import { cursorModule } from './cursor';
import { clipboardModule } from './clipboard';
import { clockModule } from './clock';
import { heroModule } from './hero';

export interface MotionModule {
  init(root: HTMLElement | Document, ctx: MotionContext): void;
  cleanup(): void;
}

const registry = new Map<string, MotionModule>([
  ['reveal', revealModule],
  ['scrub', scrubModule],
  ['counter', counterModule],
  ['marquee', marqueeModule],
  ['capability', capabilityModule],
  ['cursor', cursorModule],
  ['clipboard', clipboardModule],
  ['clock', clockModule],
  ['hero', heroModule],
]);

let pageMatchMedia: gsap.MatchMedia | null = null;

/**
 * Registers an interaction module keyed by data-motion name or identifier.
 */
export function register(name: string, module: MotionModule): void {
  registry.set(name, module);
}

/**
 * Initializes all registered motion modules for the current document.
 */
export function initAll(root: HTMLElement | Document = document): void {
  if (typeof window === 'undefined') return;

  if (pageMatchMedia) {
    pageMatchMedia.revert();
  }
  pageMatchMedia = gsap.matchMedia();

  const ctx = getMotionContext();
  ctx.mm = pageMatchMedia;

  for (const [, module] of registry) {
    try {
      module.init(root, ctx);
    } catch (err) {
      console.error('Failed to init motion module:', err);
    }
  }

  ScrollTrigger.refresh();
}

/**
 * Cleans up all registered motion modules before route swap or page unload.
 */
export function cleanupAll(): void {
  for (const [, module] of registry) {
    try {
      module.cleanup();
    } catch (err) {
      console.error('Failed to cleanup motion module:', err);
    }
  }

  if (pageMatchMedia) {
    pageMatchMedia.revert();
    pageMatchMedia = null;
  }
}
