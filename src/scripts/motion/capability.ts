// Capability Row Accordion (I-15) per docs/01-design/interaction-motion.md.
// Expand on hover, focus and tap with grid-rows transition; cursor-following visual on desktop only.
import { gsap } from 'gsap';
import type { MotionModule } from './registry';

let cleanups: (() => void)[] = [];

export const capabilityModule: MotionModule = {
  init(root, ctx) {
    const rows = root.querySelectorAll<HTMLDetailsElement>('details.capability-row');
    if (rows.length === 0) return;

    // Desktop cursor-following visual container
    let visualEl: HTMLElement | null = null;
    let xTo: ((val: number) => void) | null = null;
    let yTo: ((val: number) => void) | null = null;

    if (ctx.finePointer && !ctx.reduced) {
      visualEl = document.querySelector<HTMLElement>('#capability-floating-visual');
      if (!visualEl) {
        visualEl = document.createElement('div');
        visualEl.id = 'capability-floating-visual';
        visualEl.className = 'capability-floating-visual';
        visualEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(visualEl);
      }
      xTo = gsap.quickTo(visualEl, 'x', { duration: 0.35, ease: 'power3.out' });
      yTo = gsap.quickTo(visualEl, 'y', { duration: 0.35, ease: 'power3.out' });
    }

    rows.forEach((row) => {
      const summary = row.querySelector('summary');
      if (!summary) return;

      // Tap / Click handling with smooth grid-rows
      const toggleHandler = () => {
        // Toggle state class
        if (row.open) {
          row.classList.add('is-expanded');
        } else {
          row.classList.remove('is-expanded');
          delete row.dataset.hoverOpened;
        }
      };
      row.addEventListener('toggle', toggleHandler);
      cleanups.push(() => row.removeEventListener('toggle', toggleHandler));

      // Fine pointer: expand on hover and drive floating follower
      if (ctx.finePointer) {
        const mouseEnter = (e: MouseEvent) => {
          if (!row.open) {
            row.dataset.hoverOpened = 'true';
            row.open = true;
            row.classList.add('is-expanded');
          }
          if (visualEl) {
            const rowTitle = row.querySelector('.row-title')?.textContent?.trim() || '';
            visualEl.textContent = rowTitle;
            visualEl.classList.add('is-active');
            xTo?.(e.clientX + 20);
            yTo?.(e.clientY - 10);
          }
        };

        const mouseMove = (e: MouseEvent) => {
          if (visualEl?.classList.contains('is-active')) {
            xTo?.(e.clientX + 20);
            yTo?.(e.clientY - 10);
          }
        };

        const mouseLeave = () => {
          // Keep active state clean
          if (visualEl) {
            visualEl.classList.remove('is-active');
          }
          if (row.dataset.hoverOpened === 'true') {
            delete row.dataset.hoverOpened;
            row.open = false;
            row.classList.remove('is-expanded');
          }
        };

        const focusIn = () => {
          if (!row.open) {
            row.dataset.hoverOpened = 'true';
            row.open = true;
            row.classList.add('is-expanded');
          }
        };

        const focusOut = (e: FocusEvent) => {
          if (!row.contains(e.relatedTarget as Node | null)) {
            if (row.dataset.hoverOpened === 'true') {
              delete row.dataset.hoverOpened;
              row.open = false;
              row.classList.remove('is-expanded');
            }
          }
        };

        const clickSummary = () => {
          // If clicked by user, it is an explicit toggle, not a transient hover
          delete row.dataset.hoverOpened;
        };

        summary.addEventListener('click', clickSummary);
        row.addEventListener('mouseenter', mouseEnter);
        row.addEventListener('mousemove', mouseMove);
        row.addEventListener('mouseleave', mouseLeave);
        row.addEventListener('focusin', focusIn);
        row.addEventListener('focusout', focusOut);

        cleanups.push(() => {
          summary.removeEventListener('click', clickSummary);
          row.removeEventListener('mouseenter', mouseEnter);
          row.removeEventListener('mousemove', mouseMove);
          row.removeEventListener('mouseleave', mouseLeave);
          row.removeEventListener('focusin', focusIn);
          row.removeEventListener('focusout', focusOut);
        });
      }
    });
  },

  cleanup() {
    cleanups.forEach((fn) => fn());
    cleanups = [];
    const visualEl = document.getElementById('capability-floating-visual');
    if (visualEl) {
      visualEl.remove();
    }
  },
};
