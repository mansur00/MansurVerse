// Footer Local Time (I-21) per docs/01-design/interaction-motion.md.
// Updates every 30 seconds using Intl.DateTimeFormat with configured timezone from site config.
import type { MotionModule } from './registry';

let timerId: ReturnType<typeof setInterval> | null = null;

function formatLocalTime(timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timeZone === 'UTC' ? 'UTC' : timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatter.format(new Date())} ${timeZone}`;
  } catch {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  }
}

export const clockModule: MotionModule = {
  init(root) {
    const timeElements = root.querySelectorAll<HTMLElement>('.time-value[data-timezone]');
    if (timeElements.length === 0) return;

    const updateAll = () => {
      timeElements.forEach((el) => {
        const tz = el.getAttribute('data-timezone') || 'UTC';
        el.textContent = formatLocalTime(tz);
      });
    };

    updateAll();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateAll, 30_000);
  },

  cleanup() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  },
};
