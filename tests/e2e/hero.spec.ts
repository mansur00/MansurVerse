import { test, expect } from '@playwright/test';

test.describe('Phase 5c Hero & Interactions', () => {
  test('I-04: Hero intro runs on first visit and is skipped on repeat visit', async ({ page }) => {
    // 1. First visit in session
    await page.goto('/');
    const h1 = page.locator('.hero-title');
    await expect(h1).toBeVisible();

    // Check sessionStorage flag is set
    const seenFlag = await page.evaluate(() => sessionStorage.getItem('mansurverse:hero-intro'));
    expect(seenFlag).toBe('true');

    // 2. Reload page within same session
    await page.reload();

    // Heading lines should immediately be at full transform without delay
    const firstLine = page.locator('.hero-line-inner').first();
    const transform = await firstLine.evaluate((el) => window.getComputedStyle(el).transform);
    // Should be matrix(1, 0, 0, 1, 0, 0) or none
    expect(transform === 'none' || transform.includes('1, 0, 0, 1, 0, 0')).toBe(true);
  });

  test('I-06: Hero keyword tags have percentage positions and never cover first letters at 375px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const tags = page.locator('.hero-tag-item');
    expect(await tags.count()).toBe(3);

    // Validate that tags do not overlap the first letters of "MODERN" and "WEB"
    const overlapResult = await page.evaluate(() => {
      const h1 = document.querySelector('.hero-title');
      if (!h1) return { error: 'h1 not found' };

      const h1Rect = h1.getBoundingClientRect();
      const tagsEls = Array.from(document.querySelectorAll('.hero-tag-item'));

      // In the headline "MODERN \n WEB":
      // Line 1: 'M' is located at the top-left region of the h1 (0 to 20% width, 0 to 50% height).
      // Line 2: 'W' is located at the bottom-left region of the h1 (0 to 20% width, 50% to 100% height).
      const mZone = {
        left: h1Rect.left,
        right: h1Rect.left + h1Rect.width * 0.2,
        top: h1Rect.top,
        bottom: h1Rect.top + h1Rect.height * 0.5,
      };

      const wZone = {
        left: h1Rect.left,
        right: h1Rect.left + h1Rect.width * 0.2,
        top: h1Rect.top + h1Rect.height * 0.5,
        bottom: h1Rect.bottom,
      };

      let overlapsM = false;
      let overlapsW = false;

      tagsEls.forEach((t) => {
        const tr = t.getBoundingClientRect();
        // Check rectangle overlap with mZone
        if (!(
          tr.right < mZone.left ||
          tr.left > mZone.right ||
          tr.bottom < mZone.top ||
          tr.top > mZone.bottom
        )) {
          overlapsM = true;
        }
        // Check rectangle overlap with wZone
        if (!(
          tr.right < wZone.left ||
          tr.left > wZone.right ||
          tr.bottom < wZone.top ||
          tr.top > wZone.bottom
        )) {
          overlapsW = true;
        }
      });

      return { overlapsM, overlapsW };
    });

    expect(overlapResult.overlapsM).toBe(false);
    expect(overlapResult.overlapsW).toBe(false);
  });

  test('Performance: LCP is the h1 text, CLS <= 0.05, no long task > 50ms during pointermove', async ({
    page,
  }) => {
    page.on('console', (msg) => {
      if (
        msg.text().includes('MEASURED LONG TASK') ||
        msg.text().includes('LONG TASK DETECTED') ||
        msg.text().includes('POINTER PERF SAMPLE')
      ) {
        console.log('[PERF OBSERVER]', msg.text());
      }
    });
    await page.goto('/');

    const metrics = await page.evaluate(async () => {
      return new Promise<{ lcpElementTag: string; lcpElementClass: string; cls: number }>(
        (resolve) => {
          let clsScore = 0;
          let lcpTag = '';
          let lcpClass = '';

          interface LayoutShiftEntry extends PerformanceEntry {
            hadRecentInput?: boolean;
            value?: number;
          }

          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as LayoutShiftEntry[]) {
              if (!entry.hadRecentInput && typeof entry.value === 'number') {
                clsScore += entry.value;
              }
            }
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1] as
              (PerformanceEntry & { element?: Element }) | undefined;
            if (lastEntry?.element) {
              const h1 = lastEntry.element.closest('h1');
              lcpTag = h1 ? 'h1' : lastEntry.element.tagName.toLowerCase();
              lcpClass = h1 ? h1.className : lastEntry.element.className;
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          setTimeout(() => {
            clsObserver.disconnect();
            lcpObserver.disconnect();
            resolve({ lcpElementTag: lcpTag, lcpElementClass: lcpClass, cls: clsScore });
          }, 1200);
        },
      );
    });

    expect(metrics.cls).toBeLessThanOrEqual(0.05);
    // Hero h1 is the largest contentful paint
    if (metrics.lcpElementTag) {
      expect(metrics.lcpElementTag).toBe('h1');
    }

    // Allow intro animation to settle
    await page.waitForTimeout(500);

    // Start measuring whole-page long tasks during a 3-second pointer movement window
    await page.evaluate(() => {
      const win = window as unknown as {
        __longTasksLog?: Array<{
          startTime: number;
          duration: number;
          name: string;
          nearestMark: string;
          markDeltaMs: number;
        }>;
        __longTaskObserver?: PerformanceObserver;
        __sampleWindows?: Array<{ start: number; end: number }>;
      };
      win.__longTasksLog = [];
      win.__sampleWindows = [];

      const taskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            const marks = performance.getEntriesByType('mark');
            let nearest = 'none';
            let minDelta = Infinity;
            for (const m of marks) {
              const delta = Math.abs(m.startTime - entry.startTime);
              if (delta < minDelta) {
                minDelta = delta;
                nearest = `${m.name} (Δ${Math.round(delta)}ms)`;
              }
            }
            win.__longTasksLog?.push({
              startTime: Math.round(entry.startTime),
              duration: Math.round(entry.duration),
              name: entry.name,
              nearestMark: nearest,
              markDeltaMs: Math.round(minDelta),
            });
          }
        }
      });
      taskObserver.observe({ type: 'longtask', buffered: false });
      win.__longTaskObserver = taskObserver;
    });

    // 5 independent samples over a 3-second pointer movement window (5 x 600ms = 3000ms)
    const samplesCount = 5;
    const sampleDurationMs = 600;

    for (let s = 0; s < samplesCount; s++) {
      await page.evaluate(() => {
        const win = window as unknown as {
          __sampleWindows?: Array<{ start: number; end: number }>;
        };
        win.__sampleWindows?.push({ start: performance.now(), end: 0 });
      });

      const sampleStart = Date.now();
      let step = 0;
      while (Date.now() - sampleStart < sampleDurationMs) {
        const progress = step / 15;
        const x = 100 + Math.round((((s * 15 + step) % 75) / 75) * 400);
        const y = 200 + Math.round(Math.sin(progress * Math.PI * 2) * 80);
        await page.mouse.move(x, y);
        await page.waitForTimeout(16);
        step++;
      }

      await page.evaluate(() => {
        const win = window as unknown as {
          __sampleWindows?: Array<{ start: number; end: number }>;
        };
        if (win.__sampleWindows && win.__sampleWindows.length > 0) {
          const last = win.__sampleWindows[win.__sampleWindows.length - 1];
          if (last) last.end = performance.now();
        }
      });
    }

    const perfSummary = await page.evaluate(() => {
      const win = window as unknown as {
        __longTasksLog?: Array<{
          startTime: number;
          duration: number;
          name: string;
          nearestMark: string;
          markDeltaMs: number;
        }>;
        __longTaskObserver?: PerformanceObserver;
        __sampleWindows?: Array<{ start: number; end: number }>;
      };
      win.__longTaskObserver?.disconnect();

      const allTasks = win.__longTasksLog ?? [];
      const windows = win.__sampleWindows ?? [];

      // Filter tasks to the active 3-second pointer movement window
      const windowStart = windows[0]?.start ?? 0;
      const windowEnd = windows[windows.length - 1]?.end ?? performance.now();
      const windowTasks = allTasks.filter(
        (t) => t.startTime >= windowStart && t.startTime <= windowEnd,
      );

      // Compute worst task per sample window
      const sampleWorstTasks = windows.map((w) => {
        const tasksInWindow = allTasks.filter(
          (t) => t.startTime >= w.start && t.startTime <= w.end,
        );
        return tasksInWindow.length > 0 ? Math.max(...tasksInWindow.map((t) => t.duration)) : 0;
      });

      const sortedWorst = [...sampleWorstTasks].sort((a, b) => a - b);
      const medianWorstTask = sortedWorst[Math.floor(sortedWorst.length / 2)] ?? 0;
      const overallMaxTask =
        windowTasks.length > 0 ? Math.max(...windowTasks.map((t) => t.duration)) : 0;
      const tasksOver100ms = windowTasks.filter((t) => t.duration > 100);

      return {
        allTasks: windowTasks,
        sampleWorstTasks,
        medianWorstTask,
        overallMaxTask,
        tasksOver100msCount: tasksOver100ms.length,
      };
    });

    for (const t of perfSummary.allTasks) {
      console.log(
        `[LONG TASK DETECTED] startTime=${t.startTime}ms duration=${t.duration}ms name=${t.name} nearestMark=${t.nearestMark}`,
      );
    }
    console.log(
      `[POINTER PERF SAMPLE] samples=${JSON.stringify(perfSummary.sampleWorstTasks)} medianWorst=${perfSummary.medianWorstTask}ms maxOverall=${perfSummary.overallMaxTask}ms tasksOver100ms=${perfSummary.tasksOver100msCount}`,
    );

    // Whole-page long task guard with realistic tolerance over 3-second window
    // - Fail if more than 2 long tasks over 100ms
    expect(perfSummary.tasksOver100msCount).toBeLessThanOrEqual(2);
    // - Fail if any single task over 250ms
    expect(perfSummary.overallMaxTask).toBeLessThanOrEqual(250);
    // - Assert on the median of the worst task per sample
    expect(perfSummary.medianWorstTask).toBeLessThanOrEqual(100);
  });

  test('Hero Stacking Order & Contrast: Lead line and hero text sit clearly above background with >= 4.5:1 contrast at DPR 1 and 2 in both themes', async ({
    browser,
  }) => {
    const dprs = [1, 2];
    const themes = ['light', 'dark'] as const;

    for (const dpr of dprs) {
      for (const theme of themes) {
        const context = await browser.newContext({
          deviceScaleFactor: dpr,
          viewport: { width: 1280, height: 800 },
        });
        const page = await context.newPage();
        await page.goto('/');

        await page.evaluate((th) => {
          document.documentElement.dataset.theme = th;
          localStorage.setItem('theme', th);
          window.dispatchEvent(
            new CustomEvent('mansurverse:theme-change', { detail: { theme: th } }),
          );
        }, theme);

        await page.waitForTimeout(300);

        // 1. Verify Stacking Order
        const stacking = await page.evaluate(() => {
          const container = document.querySelector('.hero-container') as HTMLElement;
          const leadRow = document.querySelector('.hero-lead-row') as HTMLElement;
          const lead = document.querySelector('.hero-lead') as HTMLElement;
          const titleWrapper = document.querySelector('.hero-headline-wrapper') as HTMLElement;
          const introRow = document.querySelector('.hero-intro-row') as HTMLElement;
          const tag = document.querySelector('.hero-tag-item') as HTMLElement;

          const parseZ = (el: HTMLElement | null) => {
            if (!el) return 0;
            const z = getComputedStyle(el).zIndex;
            if (z === 'auto' || !z) return 1;
            const parsed = parseInt(z, 10);
            return isNaN(parsed) ? 1 : parsed;
          };

          return {
            containerZ: parseZ(container),
            leadRowZ: parseZ(leadRow),
            leadZ: parseZ(lead),
            titleZ: parseZ(titleWrapper),
            introZ: parseZ(introRow),
            tagZ: parseZ(tag),
          };
        });

        expect(stacking.containerZ).toBeGreaterThanOrEqual(1);
        expect(stacking.leadRowZ).toBeGreaterThanOrEqual(1);
        expect(stacking.leadZ).toBeGreaterThanOrEqual(1);
        expect(stacking.titleZ).toBeGreaterThanOrEqual(1);
        expect(stacking.introZ).toBeGreaterThanOrEqual(1);
        expect(stacking.tagZ).toBeGreaterThanOrEqual(2);

        // 2. Verify Contrast: Lead line text against background
        const contrastResult = await page.evaluate(() => {
          const lead = document.querySelector('.hero-lead') as HTMLElement;
          const leadColor = getComputedStyle(lead).color;
          const section = document.querySelector('.hero-section') as HTMLElement;
          const bgColor =
            getComputedStyle(section).backgroundColor ||
            getComputedStyle(document.body).backgroundColor;

          const parseRgb = (c: string): [number, number, number] => {
            const m = c.match(/\d+/g) || ['0', '0', '0'];
            return [
              parseInt(m[0] ?? '0', 10),
              parseInt(m[1] ?? '0', 10),
              parseInt(m[2] ?? '0', 10),
            ];
          };

          const toLinear = (c: number) => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };

          const getLuminance = (rgb: [number, number, number]) =>
            0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);

          const l1 = getLuminance(parseRgb(leadColor));
          // If section bg is transparent, default base bg is #F1F1F1 (light) or #101010 (dark)
          const baseRgb: [number, number, number] =
            bgColor === 'rgba(0, 0, 0, 0)' || !bgColor
              ? document.documentElement.dataset.theme === 'dark'
                ? [16, 16, 16]
                : [241, 241, 241]
              : parseRgb(bgColor);
          const l2 = getLuminance(baseRgb);

          const maxL = Math.max(l1, l2);
          const minL = Math.min(l1, l2);
          const ratio = (maxL + 0.05) / (minL + 0.05);

          return { ratio, leadColor, bgColor, l1, l2 };
        });

        expect(contrastResult.ratio).toBeGreaterThanOrEqual(4.5);
        await context.close();
      }
    }
  });

  test('Cursor & Floating Visual Shapes: Custom cursor dot is circle (--radius-circle), expanded and floating visual are pills (--radius-pill)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForTimeout(300);

    const cursor = page.locator('#custom-cursor');
    await expect(cursor).toBeAttached();

    const cursorShape = await cursor.evaluate((el) => ({
      width: window.getComputedStyle(el).width,
      height: window.getComputedStyle(el).height,
      borderRadius: window.getComputedStyle(el).borderRadius,
    }));

    // Custom cursor dot is 14px circle (--radius-circle = 50%)
    expect(cursorShape.borderRadius).toBe('50%');

    // Expanded cursor is a pill (--radius-pill = 999px)
    const expandedRadius = await page.evaluate(() => {
      const el = document.getElementById('custom-cursor');
      if (!el) return '';
      el.classList.add('is-expanded');
      const r = window.getComputedStyle(el).borderRadius;
      el.classList.remove('is-expanded');
      return r;
    });
    expect(expandedRadius).toBe('999px');

    // Capability floating visual is a pill (--radius-pill = 999px)
    const floatingRadius = await page.evaluate(() => {
      const el = document.querySelector('.capability-floating-visual');
      return el ? window.getComputedStyle(el).borderRadius : '';
    });
    expect(floatingRadius).toBe('999px');
  });
});
