// Statement Scrub (I-10) and Bio Scrub (I-30) per docs/01-design/interaction-motion.md.
// Words progressively change from muted to primary colour governed by scroll progress.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionModule } from './registry';

gsap.registerPlugin(ScrollTrigger);

let scrubTriggers: ScrollTrigger[] = [];

export const scrubModule: MotionModule = {
  init(root, ctx) {
    if (ctx.reduced) {
      // All words immediately filled under reduced motion
      root
        .querySelectorAll<HTMLElement>('[data-motion="statement-scrub"], [data-motion="bio-scrub"]')
        .forEach((container) => {
          container.querySelectorAll('.word-span').forEach((w) => w.classList.add('is-filled'));
        });
      return;
    }

    const scrubTargets = root.querySelectorAll<HTMLElement>(
      '[data-motion="statement-scrub"], [data-motion="bio-scrub"]',
    );

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

      const trigger = ScrollTrigger.create({
        trigger: target,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalWords = words.length;
          const activeIndex = Math.min(totalWords - 1, Math.floor(progress * totalWords));

          words.forEach((word, idx) => {
            if (idx <= activeIndex) {
              word.classList.add('is-filled');
            } else {
              word.classList.remove('is-filled');
            }
          });
        },
      });
      scrubTriggers.push(trigger);
    });
  },

  cleanup() {
    scrubTriggers.forEach((t) => t.kill());
    scrubTriggers = [];
  },
};
