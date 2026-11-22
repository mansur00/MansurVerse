// Scroll Reveal (I-08) & Line Reveal for Headings (I-09) per docs/01-design/interaction-motion.md.
// Accessible: original text kept in aria-label, split spans hidden from assistive tech.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { MotionModule } from './registry';

gsap.registerPlugin(ScrollTrigger, SplitText);

let triggers: ScrollTrigger[] = [];
let splitInstances: SplitText[] = [];

export const revealModule: MotionModule = {
  init(root, ctx) {
    if (ctx.reduced) {
      // Content remains visible in final state under reduced motion
      root.querySelectorAll<HTMLElement>('[data-motion="reveal"]').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const durationSec = ctx.tokens.ms.slow / 1000;
    const staggerSec = ctx.tokens.ms.stagger / 1000;

    // 1. Scroll Reveal (I-08): elements rise 28px and fade in once at 15% visibility
    const revealContainers = root.querySelectorAll<HTMLElement>(
      '[data-motion-container="reveal"], [data-motion="reveal"]',
    );

    revealContainers.forEach((container) => {
      const isContainer = container.hasAttribute('data-motion-container');
      const targets = isContainer
        ? container.querySelectorAll<HTMLElement>('[data-motion="reveal"]')
        : [container];

      if (targets.length === 0) return;

      gsap.set(targets, { opacity: 0, y: 28 });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: durationSec,
            ease: 'power3.out',
            stagger: isContainer ? staggerSec : 0,
            clearProps: 'transform',
          });
        },
      });
      triggers.push(trigger);
    });

    // 2. Line Reveal for Headings (I-09): SplitText by lines inside masks
    const lineHeadings = root.querySelectorAll<HTMLElement>('[data-motion="line-reveal"]');
    lineHeadings.forEach((heading) => {
      const originalText = heading.textContent?.trim() ?? '';
      if (!originalText) return;

      // Preserve accessible name on container
      heading.setAttribute('aria-label', originalText);

      const split = new SplitText(heading, {
        type: 'lines',
        linesClass: 'line-child',
      });
      splitInstances.push(split);

      // Mask wrapper for each line
      const maskWrap = new SplitText(heading, {
        type: 'lines',
        linesClass: 'line-mask overflow-hidden inline-block w-full',
      });
      splitInstances.push(maskWrap);

      // Hide split inner spans from accessibility tree
      split.lines.forEach((line) => {
        line.setAttribute('aria-hidden', 'true');
      });

      gsap.set(split.lines, { yPercent: 100 });

      const trigger = ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
          });
        },
      });
      triggers.push(trigger);
    });
  },

  cleanup() {
    triggers.forEach((t) => t.kill());
    triggers = [];
    splitInstances.forEach((s) => {
      try {
        s.revert();
      } catch {
        // Revert failed or already reverted
      }
    });
    splitInstances = [];
  },
};
