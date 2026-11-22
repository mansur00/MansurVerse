// Statement Scrub (I-10) and Bio Scrub (I-30) per docs/01-design/interaction-motion.md.
// Words progressively change from muted to primary colour governed by scroll progress.
// Optimized: single ScrollTrigger per statement that updates classes only when active word index changes.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionModule } from './registry';
import { isFeatureDisabled } from '../debug/features';
import { MOTION_CHANGE_EVENT, isReducedMotion } from './context';

gsap.registerPlugin(ScrollTrigger);

let scrubTriggers: ScrollTrigger[] = [];
let scrubMotionCleanup: (() => void) | null = null;

export const scrubModule: MotionModule = {
  init(root, ctx) {
    if (isFeatureDisabled('scrub')) return;

    const scrubTargets = root.querySelectorAll<HTMLElement>(
      '[data-motion="statement-scrub"], [data-motion="bio-scrub"]',
    );
    if (scrubTargets.length === 0) return;

    if (ctx.reduced) {
      // All words immediately filled under reduced motion
      scrubTargets.forEach((container) => {
        container.querySelectorAll('.word-span').forEach((w) => w.classList.add('is-filled'));
      });
      return;
    }

    scrubTargets.forEach((target) => {
      // If words are not already wrapped in word-spans (e.g. bio paragraphs)
      if (target.querySelectorAll('.word-span').length === 0) {
        const text = target.textContent?.trim() ?? '';
        if (text) {
          target.innerHTML = '';
          const words = text.split(/\s+/);
          words.forEach((w) => {
            const span = document.createElement('span');
            span.className = 'word-span';
            span.textContent = w + ' ';
            target.appendChild(span);
          });
        }
      }

      const words = Array.from(target.querySelectorAll<HTMLElement>('.word-span'));
      if (words.length === 0) return;

      let lastActiveIndex = -1;

      const trigger = ScrollTrigger.create({
        trigger: target,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalWords = words.length;
          const activeIndex = Math.min(totalWords - 1, Math.floor(progress * totalWords));

          // Exit immediately if active word index has not changed (avoids per-frame DOM updates)
          if (activeIndex === lastActiveIndex) return;

          if (activeIndex > lastActiveIndex) {
            for (let i = Math.max(0, lastActiveIndex + 1); i <= activeIndex; i++) {
              words[i]?.classList.add('is-filled');
            }
          } else {
            for (let i = activeIndex + 1; i <= Math.min(totalWords - 1, lastActiveIndex); i++) {
              words[i]?.classList.remove('is-filled');
            }
          }

          lastActiveIndex = activeIndex;
          target.style.setProperty('--active-word', String(activeIndex));
        },
      });
      scrubTriggers.push(trigger);
    });

    const onMotionChange = () => {
      if (isReducedMotion()) {
        scrubTriggers.forEach((t) => t.kill());
        scrubTriggers = [];
        scrubTargets.forEach((container) => {
          container.querySelectorAll('.word-span').forEach((w) => w.classList.add('is-filled'));
        });
      }
    };
    window.addEventListener(MOTION_CHANGE_EVENT, onMotionChange);
    scrubMotionCleanup = () => {
      window.removeEventListener(MOTION_CHANGE_EVENT, onMotionChange);
    };
  },

  cleanup() {
    if (scrubMotionCleanup) {
      scrubMotionCleanup();
      scrubMotionCleanup = null;
    }
    scrubTriggers.forEach((t) => t.kill());
    scrubTriggers = [];
  },
};
