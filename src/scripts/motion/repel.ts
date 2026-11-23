// Letter repel interaction (I-19 Contact email, I-35 404 heading distortion)
// Splits text into spans, measures bounding boxes once on init/resize, pushes away on pointermove.
import { gsap } from 'gsap';
import { isReducedMotion, isFinePointer } from './context';
import { isFeatureDisabled } from '../debug/features';

interface LetterItem {
  span: HTMLSpanElement;
  xTo: (value: number) => void;
  yTo: (value: number) => void;
  cx: number;
  cy: number;
}

export function initRepel(
  element: HTMLElement,
  feature: 'repel' | 'distortion' = 'repel',
): () => void {
  if (typeof window === 'undefined' || !element) {
    return () => {};
  }

  // Desktop only for repel per spec I-19
  if (feature === 'repel' && window.innerWidth < 768) {
    return () => {};
  }

  if (isReducedMotion() || !isFinePointer() || isFeatureDisabled(feature)) {
    return () => {};
  }

  const textContainer = element.querySelector<HTMLElement>('.btn-label') || element;
  const rawText = textContainer.textContent?.trim() || '';
  if (!rawText) return () => {};

  if (!element.getAttribute('aria-label')) {
    element.setAttribute('aria-label', rawText);
  }

  const originalHtml = textContainer.innerHTML;
  textContainer.innerHTML = rawText
    .split('')
    .map((ch) => {
      if (ch === ' ') {
        return '<span class="repel-letter" aria-hidden="true" style="display:inline-block;will-change:transform;">&nbsp;</span>';
      }
      return `<span class="repel-letter" aria-hidden="true" style="display:inline-block;will-change:transform;">${ch}</span>`;
    })
    .join('');

  const spans = Array.from(textContainer.querySelectorAll<HTMLSpanElement>('.repel-letter'));
  const letterItems: LetterItem[] = spans.map((span) => {
    return {
      span,
      xTo: gsap.quickTo(span, 'x', { duration: 0.3, ease: 'power2.out' }),
      yTo: gsap.quickTo(span, 'y', { duration: 0.3, ease: 'power2.out' }),
      cx: 0,
      cy: 0,
    };
  });

  const measure = () => {
    letterItems.forEach((item) => {
      const rect = item.span.getBoundingClientRect();
      item.cx = rect.left + rect.width / 2;
      item.cy = rect.top + rect.height / 2;
    });
  };

  measure();

  const radius = 140; // 140px radius per spec I-19
  const maxPush = 28; // up to 28px displacement per spec I-19

  const handlePointerMove = (e: PointerEvent) => {
    letterItems.forEach((item) => {
      const dx = item.cx - e.clientX;
      const dy = item.cy - e.clientY;
      const dist = Math.hypot(dx, dy);

      if (dist < radius && dist > 0) {
        const force = (1 - dist / radius) * maxPush;
        const angle = Math.atan2(dy, dx);
        item.xTo(Math.cos(angle) * force);
        item.yTo(Math.sin(angle) * force);
      } else {
        item.xTo(0);
        item.yTo(0);
      }
    });
  };

  const handlePointerLeave = () => {
    letterItems.forEach((item) => {
      item.xTo(0);
      item.yTo(0);
    });
  };

  window.addEventListener('resize', measure, { passive: true });
  element.addEventListener('pointermove', handlePointerMove, { passive: true });
  element.addEventListener('pointerleave', handlePointerLeave, { passive: true });

  return () => {
    window.removeEventListener('resize', measure);
    element.removeEventListener('pointermove', handlePointerMove);
    element.removeEventListener('pointerleave', handlePointerLeave);
    letterItems.forEach((item) => {
      gsap.killTweensOf(item.span);
    });
    textContainer.innerHTML = originalHtml;
  };
}
