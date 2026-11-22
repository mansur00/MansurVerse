// Hero interactions (I-04 Hero Intro & I-06 Tag Shifts) per docs/01-design/interaction-motion.md.
import { gsap } from 'gsap';
import type { MotionModule } from './registry';
import { DIGIT_FIELD } from '../webgl/constants';
import { isFeatureDisabled } from '../debug/features';

const HERO_INTRO_KEY = 'mansurverse:hero-intro';

let pointerCleanup: (() => void) | null = null;
let introTimeline: gsap.core.Timeline | null = null;

export const heroModule: MotionModule = {
  init(root, ctx) {
    const heroSection = root.querySelector<HTMLElement>('.hero-section');
    if (!heroSection) return;

    const headingLines = heroSection.querySelectorAll<HTMLElement>('.hero-line-inner');
    const tags = heroSection.querySelectorAll<HTMLElement>('.hero-tag-item');
    const digitCanvas = heroSection.querySelector<HTMLElement>('#digit-field-canvas');

    // 1. I-04 Hero Intro (Once per session via sessionStorage)
    let seenIntro = false;
    try {
      seenIntro = sessionStorage.getItem(HERO_INTRO_KEY) === 'true';
    } catch {
      seenIntro = false;
    }

    if (!seenIntro && !ctx.reduced && headingLines.length > 0) {
      try {
        sessionStorage.setItem(HERO_INTRO_KEY, 'true');
      } catch {
        // Ignore storage write failures
      }

      // Initial intro state
      gsap.set(headingLines, { yPercent: 100 });
      gsap.set(tags, { scale: 0, opacity: 0 });
      if (digitCanvas) gsap.set(digitCanvas, { opacity: 0 });

      introTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Heading lines rise from masks over 900ms, 120ms stagger
      introTimeline.to(headingLines, {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.12,
      });

      // Tags scale in
      introTimeline.to(
        tags,
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.5)',
        },
        '-=0.5',
      );

      // Digit field fades in over 600ms
      if (digitCanvas) {
        introTimeline.to(
          digitCanvas,
          {
            opacity: DIGIT_FIELD.peakOpacity,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'opacity',
          },
          '-=0.4',
        );
      }
    } else {
      // Immediate final state
      gsap.set(headingLines, { yPercent: 0 });
      gsap.set(tags, { scale: 1, opacity: 1 });
      if (digitCanvas) digitCanvas.style.opacity = '';
    }

    // 2. I-06 Hero Keyword Tags pointer shift (Fine pointers only)
    if (!isFeatureDisabled('tags') && ctx.finePointer && !ctx.reduced && tags.length > 0) {
      const offsets = [16, -12, 10];
      const quickTos = Array.from(tags).map((tag) => ({
        x: gsap.quickTo(tag, 'x', { duration: 0.4, ease: 'power2.out' }),
        y: gsap.quickTo(tag, 'y', { duration: 0.4, ease: 'power2.out' }),
      }));

      let rect = heroSection.getBoundingClientRect();
      const onResizeOrScroll = () => {
        rect = heroSection.getBoundingClientRect();
      };
      let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
      const onDebouncedScroll = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(onResizeOrScroll, 150);
      };

      window.addEventListener('resize', onResizeOrScroll, { passive: true });
      window.addEventListener('scroll', onDebouncedScroll, { passive: true });

      const onPointerMove = (e: PointerEvent) => {
        const halfW = rect.width / 2 || 1;
        const halfH = rect.height / 2 || 1;
        const centerX = rect.left + halfW;
        const centerY = rect.top + halfH;
        const normX = (e.clientX - centerX) / halfW;
        const normY = (e.clientY - centerY) / halfH;

        quickTos.forEach((q, idx) => {
          const k = offsets[idx] ?? 12;
          q.x(normX * k);
          q.y(normY * k);
        });
      };

      const onPointerLeave = () => {
        quickTos.forEach((q) => {
          q.x(0);
          q.y(0);
        });
      };

      heroSection.addEventListener('pointermove', onPointerMove, { passive: true });
      heroSection.addEventListener('pointerleave', onPointerLeave);

      pointerCleanup = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        window.removeEventListener('resize', onResizeOrScroll);
        window.removeEventListener('scroll', onDebouncedScroll);
        heroSection.removeEventListener('pointermove', onPointerMove);
        heroSection.removeEventListener('pointerleave', onPointerLeave);
      };
    }
  },

  cleanup() {
    if (introTimeline) {
      introTimeline.kill();
      introTimeline = null;
    }
    if (pointerCleanup) {
      pointerCleanup();
      pointerCleanup = null;
    }
  },
};
