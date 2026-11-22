// Copy to Clipboard (I-20) per docs/01-design/interaction-motion.md.
// Click copies; label becomes "Copied ✓" for 1800ms then resets.
// Announced via aria-live polite region. Fallback if clipboard API unavailable.
import type { MotionModule } from './registry';

let cleanups: (() => void)[] = [];

export const clipboardModule: MotionModule = {
  init(root) {
    const copyElements = root.querySelectorAll<HTMLElement>(
      '[data-copy], [data-motion="copy-clipboard"], .email-display',
    );

    copyElements.forEach((el) => {
      const copyText =
        el.getAttribute('data-copy') ||
        el.getAttribute('href')?.replace('mailto:', '') ||
        el.textContent?.trim() ||
        '';

      if (!copyText) return;

      const clickHandler = async (e: MouseEvent) => {
        // If it's an email link, prevent default mail client open if copy succeeded or on copy button
        if (el.hasAttribute('data-copy')) {
          e.preventDefault();
        }

        let copied = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(copyText);
            copied = true;
          }
        } catch {
          // Fallback selection technique
          const textarea = document.createElement('textarea');
          textarea.value = copyText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            copied = document.execCommand('copy');
          } catch {
            copied = false;
          }
          textarea.remove();
        }

        if (copied) {
          const prevHtml = el.innerHTML;

          el.textContent = 'Copied ✓';
          el.setAttribute('data-copied', 'true');

          // Live region announcement
          const announcer = document.getElementById('page-announcer');
          if (announcer) {
            announcer.textContent = `Copied ${copyText} to clipboard`;
          }

          setTimeout(() => {
            el.innerHTML = prevHtml;
            el.removeAttribute('data-copied');
          }, 1800);
        }
      };

      el.addEventListener('click', clickHandler);
      cleanups.push(() => el.removeEventListener('click', clickHandler));
    });
  },

  cleanup() {
    cleanups.forEach((fn) => fn());
    cleanups = [];
  },
};
