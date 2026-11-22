// Custom Cursor (I-11) and Magnetic Buttons (I-12) per docs/01-design/interaction-motion.md.
// Fine pointers only; system cursor remains visible; disabled on touch devices.
import { gsap } from 'gsap';
import type { MotionModule } from './registry';
import { isFeatureDisabled } from '../debug/features';
import { MOTION_CHANGE_EVENT, isReducedMotion } from './context';

let pointerListener: ((e: PointerEvent) => void) | null = null;
let pointerLeaveListener: (() => void) | null = null;
let motionChangeListener: ((e: Event) => void) | null = null;
let cursorEl: HTMLElement | null = null;
let labelEl: HTMLElement | null = null;
let magneticCleanups: (() => void)[] = [];

export const cursorModule: MotionModule = {
  init(root, ctx) {
    if (isFeatureDisabled('cursor')) return;

    if (!ctx.finePointer) {
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }

    // 1. Setup custom cursor element
    cursorEl = document.querySelector<HTMLElement>('#custom-cursor');
    if (!cursorEl) {
      cursorEl = document.createElement('div');
      cursorEl.id = 'custom-cursor';
      cursorEl.className = 'custom-cursor';
      cursorEl.setAttribute('aria-hidden', 'true');
      labelEl = document.createElement('span');
      labelEl.className = 'cursor-label';
      cursorEl.appendChild(labelEl);
      document.body.appendChild(cursorEl);
    } else {
      labelEl = cursorEl.querySelector<HTMLElement>('.cursor-label');
    }

    cursorEl.style.display = 'flex';

    const xTo = gsap.quickTo(cursorEl, 'x', { duration: 0.15, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursorEl, 'y', { duration: 0.15, ease: 'power3.out' });

    pointerListener = (e: PointerEvent) => {
      const t0 = performance.now();
      xTo(e.clientX);
      yTo(e.clientY);

      // Check for [data-cursor] targets
      const target = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      if (target && labelEl && cursorEl) {
        const cursorText = target.getAttribute('data-cursor') || '';
        labelEl.textContent = cursorText;
        cursorEl.classList.add('is-expanded');
      } else if (cursorEl) {
        cursorEl.classList.remove('is-expanded');
      }

      if (import.meta.env.PUBLIC_E2E === 'true') {
        const dt = performance.now() - t0;
        const win = window as unknown as {
          __pointerHandlerPerf?: { handlerTimes: number[]; maxHandlerTime: number };
        };
        if (win.__pointerHandlerPerf) {
          win.__pointerHandlerPerf.handlerTimes.push(dt);
          if (dt > win.__pointerHandlerPerf.maxHandlerTime) {
            win.__pointerHandlerPerf.maxHandlerTime = dt;
          }
        }
      }
    };

    pointerLeaveListener = () => {
      if (cursorEl) cursorEl.classList.remove('is-active', 'is-expanded');
    };

    window.addEventListener('pointermove', pointerListener, { passive: true });
    document.addEventListener('pointerleave', pointerLeaveListener);

    // 2. I-12 Magnetic Buttons: Within 80px pulls up to 10px, label 1.4x further
    if (!ctx.reduced) {
      const magneticTargets = root.querySelectorAll<HTMLElement>(
        '.button, [data-magnetic], .nav-link, button.theme-toggle, button.motion-toggle',
      );

      interface MagneticItem {
        btn: HTMLElement;
        cx: number;
        cy: number;
        xBtnTo: gsap.QuickToFunc;
        yBtnTo: gsap.QuickToFunc;
        xLabelTo: gsap.QuickToFunc | null;
        yLabelTo: gsap.QuickToFunc | null;
        isMagnetized: boolean;
      }

      const items: MagneticItem[] = [];

      magneticTargets.forEach((btn) => {
        const label = btn.querySelector<HTMLElement>('.button-label, span');
        items.push({
          btn,
          cx: 0,
          cy: 0,
          xBtnTo: gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power2.out' }),
          yBtnTo: gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power2.out' }),
          xLabelTo: label ? gsap.quickTo(label, 'x', { duration: 0.4, ease: 'power2.out' }) : null,
          yLabelTo: label ? gsap.quickTo(label, 'y', { duration: 0.4, ease: 'power2.out' }) : null,
          isMagnetized: false,
        });
      });

      // Cache button centers on scroll / resize to avoid forced synchronous layout reflow during mousemove
      const updateCenters = () => {
        items.forEach((item) => {
          const rect = item.btn.getBoundingClientRect();
          item.cx = rect.left + rect.width / 2;
          item.cy = rect.top + rect.height / 2;
        });
      };
      updateCenters();

      let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
      const onDebouncedScroll = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateCenters, 150);
      };

      window.addEventListener('resize', updateCenters, { passive: true });
      window.addEventListener('scroll', onDebouncedScroll, { passive: true });
      magneticCleanups.push(() => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        window.removeEventListener('resize', updateCenters);
        window.removeEventListener('scroll', onDebouncedScroll);
      });

      // Single consolidated mousemove listener with fast bounding-box exit
      const onMouseMove = (e: MouseEvent) => {
        const t0 = performance.now();
        const mx = e.clientX;
        const my = e.clientY;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item) continue;
          const dx = mx - item.cx;
          const dy = my - item.cy;

          // Quick bounding box rejection (80px radius) avoids Math.hypot when far away
          if (Math.abs(dx) > 80 || Math.abs(dy) > 80) {
            if (item.isMagnetized) {
              item.xBtnTo(0);
              item.yBtnTo(0);
              item.xLabelTo?.(0);
              item.yLabelTo?.(0);
              item.isMagnetized = false;
            }
            continue;
          }

          const dist = Math.hypot(dx, dy);
          if (dist < 80) {
            item.isMagnetized = true;
            const pull = Math.min(10, (1 - dist / 80) * 10);
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * pull;
            const moveY = Math.sin(angle) * pull;

            item.xBtnTo(moveX);
            item.yBtnTo(moveY);
            item.xLabelTo?.(moveX * 1.4);
            item.yLabelTo?.(moveY * 1.4);
          } else if (item.isMagnetized) {
            item.xBtnTo(0);
            item.yBtnTo(0);
            item.xLabelTo?.(0);
            item.yLabelTo?.(0);
            item.isMagnetized = false;
          }
        }

        if (import.meta.env.PUBLIC_E2E === 'true') {
          const dt = performance.now() - t0;
          const win = window as unknown as {
            __pointerHandlerPerf?: { handlerTimes: number[]; maxHandlerTime: number };
          };
          if (win.__pointerHandlerPerf) {
            win.__pointerHandlerPerf.handlerTimes.push(dt);
            if (dt > win.__pointerHandlerPerf.maxHandlerTime) {
              win.__pointerHandlerPerf.maxHandlerTime = dt;
            }
          }
        }
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      magneticCleanups.push(() => {
        window.removeEventListener('mousemove', onMouseMove);
        items.forEach((item) => {
          item.xBtnTo(0);
          item.yBtnTo(0);
          item.xLabelTo?.(0);
          item.yLabelTo?.(0);
        });
      });
    }
    motionChangeListener = () => {
      if (isReducedMotion()) {
        magneticCleanups.forEach((fn) => fn());
        magneticCleanups = [];
      }
    };
    window.addEventListener(MOTION_CHANGE_EVENT, motionChangeListener);
  },

  cleanup() {
    if (motionChangeListener) {
      window.removeEventListener(MOTION_CHANGE_EVENT, motionChangeListener);
      motionChangeListener = null;
    }
    if (pointerListener) {
      window.removeEventListener('pointermove', pointerListener);
      pointerListener = null;
    }
    if (pointerLeaveListener) {
      document.removeEventListener('pointerleave', pointerLeaveListener);
      pointerLeaveListener = null;
    }
    magneticCleanups.forEach((fn) => fn());
    magneticCleanups = [];
    if (cursorEl) {
      cursorEl.remove();
      cursorEl = null;
    }
  },
};
