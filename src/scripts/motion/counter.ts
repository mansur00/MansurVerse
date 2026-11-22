// Stat Counters (I-17) per docs/01-design/interaction-motion.md.
// Numbers count up to target over --motion-count (1200ms) with ease-out when entering view.
// Final value remains in DOM text and accessible name.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionModule } from './registry';

gsap.registerPlugin(ScrollTrigger);

let counterTriggers: ScrollTrigger[] = [];
let counterTweens: gsap.core.Tween[] = [];

export const counterModule: MotionModule = {
  init(root, ctx) {
    const counterElements = root.querySelectorAll<HTMLElement>(
      '[data-motion="counter"], .stat-number',
    );

    if (ctx.reduced) {
      // Keep final text value in DOM
      return;
    }

    const durationSec = ctx.tokens.ms.count / 1000;

    counterElements.forEach((el) => {
      const rawText = (el.getAttribute('data-target') || el.textContent || '').trim();
      // Match optional prefix, integer digits, and optional suffix (e.g. "08", "99%", "14+")
      const match = rawText.match(/^([^0-9]*)(\d+)(.*)$/);
      if (!match) return;

      const digits = match[2];
      if (!digits) return;

      const prefix = match[1] || '';
      const targetNum = parseInt(digits, 10);
      const suffix = match[3] || '';
      const padLength = digits.length > 1 && digits.startsWith('0') ? digits.length : 0;

      const state = { value: 0 };

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          const tween = gsap.to(state, {
            value: targetNum,
            duration: durationSec,
            ease: 'power2.out',
            onUpdate: () => {
              const currentInt = Math.round(state.value);
              const formattedNum =
                padLength > 0 ? String(currentInt).padStart(padLength, '0') : String(currentInt);
              el.textContent = `${prefix}${formattedNum}${suffix}`;
            },
            onComplete: () => {
              // Ensure exact final text in DOM
              el.textContent = rawText;
            },
          });
          counterTweens.push(tween);
        },
      });
      counterTriggers.push(trigger);
    });
  },

  cleanup() {
    counterTriggers.forEach((t) => t.kill());
    counterTriggers = [];
    counterTweens.forEach((t) => t.kill());
    counterTweens = [];
  },
};
