// Motion context and environmental capabilities per docs/01-design/interaction-motion.md
// and docs/02-engineering/animation-implementation.md.
import { gsap } from 'gsap';
import { motionMs, ease, easePoints } from '../../styles/tokens/generated/tokens';

export interface MotionContext {
  tokens: {
    ms: typeof motionMs;
    ease: typeof ease;
    easePoints: typeof easePoints;
  };
  reduced: boolean;
  finePointer: boolean;
  lowPower: boolean;
  mm: gsap.MatchMedia;
}

export const MOTION_STORAGE_KEY = 'motion';
export const MOTION_CHANGE_EVENT = 'mansurverse:motionchange';

/**
 * Checks whether reduced motion is active via user toggle or OS preference.
 */
export function isReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;

  const datasetMotion = document.documentElement.dataset['motion'];
  if (datasetMotion === 'reduced') return true;
  if (datasetMotion === 'normal') return false;

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

/**
 * Checks whether fine pointer (mouse/trackpad) is present.
 */
export function isFinePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: fine)').matches;
}

/**
 * Detects low power hardware or data-saving mode per interaction-motion.md section 4.
 */
export function isLowPower(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('lowpower') === '1' || window.location.search.includes('saveData')) {
        return true;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  if (typeof navigator === 'undefined') return false;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  if (nav.connection?.saveData === true) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true;

  return false;
}

/**
 * Dispatches a custom event to notify all motion modules of state change.
 */
export function dispatchMotionChange(reduced: boolean): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(MOTION_CHANGE_EVENT, {
      detail: { reduced },
    }),
  );
}

/**
 * Sets the motion mode ('reduced' or 'normal'), updates the DOM attribute and localStorage.
 */
export function setMotionMode(mode: 'reduced' | 'normal'): void {
  if (typeof document === 'undefined') return;

  if (mode === 'reduced') {
    document.documentElement.setAttribute('data-motion', 'reduced');
  } else {
    document.documentElement.setAttribute('data-motion', 'normal');
  }

  try {
    localStorage.setItem(MOTION_STORAGE_KEY, mode);
  } catch {
    // Storage unavailable: mode applies to current session only
  }

  dispatchMotionChange(mode === 'reduced');
}

/**
 * Toggles motion mode between reduced and normal.
 */
export function toggleMotionMode(): 'reduced' | 'normal' {
  const currentReduced = isReducedMotion();
  const nextMode = currentReduced ? 'normal' : 'reduced';
  setMotionMode(nextMode);
  return nextMode;
}

// Global OS media query change listener when user hasn't set an explicit preference
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    try {
      const stored = localStorage.getItem(MOTION_STORAGE_KEY);
      if (!stored) {
        if (e.matches) {
          document.documentElement.setAttribute('data-motion', 'reduced');
        } else {
          document.documentElement.removeAttribute('data-motion');
        }
      }
      dispatchMotionChange(isReducedMotion());
    } catch {
      // Storage unavailable
    }
  });
}

/**
 * Creates a fresh MotionContext snapshot.
 */
export function getMotionContext(): MotionContext {
  return {
    tokens: {
      ms: motionMs,
      ease,
      easePoints,
    },
    reduced: isReducedMotion(),
    finePointer: isFinePointer(),
    lowPower: isLowPower(),
    mm: gsap.matchMedia(),
  };
}
