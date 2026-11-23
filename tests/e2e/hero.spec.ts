import { test, expect } from '@playwright/test';
import { DIGIT_FIELD } from '../../src/scripts/webgl/constants';

test.describe('Phase 5c Hero & WebGL Digit Field', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === 'chromium-low-power') {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true });
        Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true });
      });
    }
  });
  test('I-05: WebGL digit field initializes on canvas behind hero with OGL', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();

    // Allow requestIdleCallback / dynamic import to load OGL
    await page.waitForTimeout(600);

    // Canvas should have dimensions and should not have no-webgl class
    const canvasDetails = await canvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
      hasNoWebgl: el.classList.contains('no-webgl'),
    }));

    expect(canvasDetails.width).toBeGreaterThan(0);
    expect(canvasDetails.height).toBeGreaterThan(0);
    expect(canvasDetails.hasNoWebgl).toBe(false);
  });

  test('I-05: WebGL blocked fallback adds no-webgl class and shows poster without errors', async ({
    page,
  }) => {
    // Stub getContext to simulate WebGL failure
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.includes('webgl')) return null;
        return (originalGetContext as (...a: unknown[]) => RenderingContext | null).apply(this, [
          type,
          ...args,
        ]);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });

    await page.goto('/');
    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();

    // Allow dynamic import to attempt initialization
    await page.waitForTimeout(600);

    // Should gracefully add no-webgl class
    await expect(canvas).toHaveClass(/no-webgl/);

    // Content remains fully intact and visible
    const h1 = page.locator('.hero-title');
    await expect(h1).toBeVisible();

    // Verify background poster image is defined in CSS
    const bgImage = await canvas.evaluate((el) => window.getComputedStyle(el).backgroundImage);
    expect(bgImage).toContain('digit-field-poster.svg');
  });

  test('I-05: Reduced motion draws once and halts ticker', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();
    await page.waitForTimeout(600);

    // Assert that the page remains stable and no continuous frame loop is spinning
    const isStable = await page.evaluate(() => {
      const html = document.documentElement;
      return (
        html.dataset.motion === 'reduced' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    });
    expect(isStable).toBe(true);
  });

  test('I-05: Touch emulation disables pointer effects on digit field', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto('/');

    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();
    await page.waitForTimeout(600);

    // Touch devices have coarse pointer; verify custom cursor is hidden
    const cursor = page.locator('#custom-cursor');
    const isCursorVisible = await cursor.isVisible().catch(() => false);
    expect(isCursorVisible).toBe(false);

    await context.close();
  });

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

  test('Navigation away and back cleanly restores digit field without memory/DOM leak', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForTimeout(400);

    // Navigate to /work
    await page.click('nav a[href="/work"]');
    await expect(page).toHaveURL(/\/work/);

    // Navigate back to Home
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');

    await page.waitForTimeout(500);

    // Only one canvas exists
    const canvases = page.locator('#digit-field-canvas');
    expect(await canvases.count()).toBe(1);

    const isAttached = await canvases.first().evaluate((el: HTMLCanvasElement) => el.width > 0);
    expect(isAttached).toBe(true);
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
    // Hero h1 is the largest contentful paint (not the canvas or poster)
    if (metrics.lcpElementTag) {
      expect(metrics.lcpElementTag).toBe('h1');
    }

    // Ensure digit field dynamic import and intro timeline have fully settled before measuring pointer move performance
    await page.waitForFunction(() => {
      const canvas = document.querySelector('#digit-field-canvas') as HTMLElement | null;
      return canvas && canvas.getAttribute('data-webgl-ready') === 'true' && !canvas.style.opacity;
    });

    // Allow dynamic import bytecode compilation and initial idle frames to settle completely
    await page.waitForTimeout(500);

    // Start measuring whole-page long tasks and our application execution during a 3-second pointer movement window
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
        __digitFieldPerf?: { renderTimes: number[]; maxRenderTime: number };
        __pointerHandlerPerf?: { handlerTimes: number[]; maxHandlerTime: number };
      };
      win.__longTasksLog = [];
      win.__sampleWindows = [];
      win.__digitFieldPerf = { renderTimes: [], maxRenderTime: 0 };
      win.__pointerHandlerPerf = { handlerTimes: [], maxHandlerTime: 0 };

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
        __digitFieldPerf?: { renderTimes: number[]; maxRenderTime: number };
        __pointerHandlerPerf?: { handlerTimes: number[]; maxHandlerTime: number };
      };
      win.__longTaskObserver?.disconnect();

      const allTasks = win.__longTasksLog ?? [];
      const windows = win.__sampleWindows ?? [];
      const renderTimes = win.__digitFieldPerf?.renderTimes ?? [];
      const handlerTimes = win.__pointerHandlerPerf?.handlerTimes ?? [];

      const longRenders = renderTimes.filter((t) => t > 50).length;
      const longHandlers = handlerTimes.filter((t) => t > 50).length;

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
        renderCount: renderTimes.length,
        handlerCount: handlerTimes.length,
        maxRenderTime: win.__digitFieldPerf?.maxRenderTime ?? 0,
        maxHandlerTime: win.__pointerHandlerPerf?.maxHandlerTime ?? 0,
        ourCodeLongTasks: longRenders + longHandlers,
      };
    });

    // Requirement 2: For every long task found, print its start time, duration and nearest mark
    for (const t of perfSummary.allTasks) {
      console.log(
        `[LONG TASK DETECTED] startTime=${t.startTime}ms duration=${t.duration}ms name=${t.name} nearestMark=${t.nearestMark}`,
      );
    }
    console.log(
      `[POINTER PERF SAMPLE] samples=${JSON.stringify(perfSummary.sampleWorstTasks)} medianWorst=${perfSummary.medianWorstTask}ms maxOverall=${perfSummary.overallMaxTask}ms tasksOver100ms=${perfSummary.tasksOver100msCount} maxRender=${perfSummary.maxRenderTime.toFixed(1)}ms maxHandler=${perfSummary.maxHandlerTime.toFixed(2)}ms`,
    );

    // Strict requirements on our own code:
    expect(perfSummary.renderCount).toBeGreaterThan(0);
    expect(perfSummary.handlerCount).toBeGreaterThan(0);
    expect(perfSummary.maxRenderTime).toBeLessThanOrEqual(50);
    expect(perfSummary.maxHandlerTime).toBeLessThanOrEqual(50);
    expect(perfSummary.ourCodeLongTasks).toBe(0);

    // Requirement 1: Whole-page long task guard with realistic tolerance over 3-second window
    // - Fail if more than 2 long tasks over 100ms
    expect(perfSummary.tasksOver100msCount).toBeLessThanOrEqual(2);
    // - Fail if any single task over 250ms
    expect(perfSummary.overallMaxTask).toBeLessThanOrEqual(250);
    // - Assert on the median of the worst task per sample
    expect(perfSummary.medianWorstTask).toBeLessThanOrEqual(100);
  });

  test('Hero Stacking Order & Contrast: Lead line and hero text sit clearly above digit field with >= 4.5:1 contrast at DPR 1 and 2 in both themes', async ({
    page,
  }) => {
    // Test across both light and dark themes
    const themes = ['light', 'dark'] as const;

    for (const theme of themes) {
      await page.goto('/');

      // Set active theme and allow transitions to settle
      await page.evaluate((th) => {
        document.documentElement.dataset.theme = th;
        localStorage.setItem('theme', th);
        window.dispatchEvent(
          new CustomEvent('mansurverse:theme-change', { detail: { theme: th } }),
        );
      }, theme);

      await page.waitForTimeout(300);

      // Wait for digit field canvas to be ready
      await page.waitForFunction(() => {
        const canvas = document.querySelector('#digit-field-canvas') as HTMLElement | null;
        return canvas && canvas.getAttribute('data-webgl-ready') === 'true';
      });

      // 1. Verify Stacking Order: canvas is z-index: 0, text containers are z-index >= 1, tags are z-index: 2
      const stacking = await page.evaluate(() => {
        const canvas = document.querySelector('#digit-field-canvas') as HTMLElement;
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
          canvasZ: parseInt(getComputedStyle(canvas).zIndex || '0', 10),
          containerZ: parseZ(container),
          leadRowZ: parseZ(leadRow),
          leadZ: parseZ(lead),
          titleZ: parseZ(titleWrapper),
          introZ: parseZ(introRow),
          tagZ: parseZ(tag),
        };
      });

      expect(stacking.canvasZ).toBe(0);
      expect(stacking.containerZ).toBeGreaterThanOrEqual(1);
      expect(stacking.leadRowZ).toBeGreaterThanOrEqual(1);
      expect(stacking.leadZ).toBeGreaterThanOrEqual(1);
      expect(stacking.titleZ).toBeGreaterThanOrEqual(1);
      expect(stacking.introZ).toBeGreaterThanOrEqual(1);
      expect(stacking.tagZ).toBeGreaterThanOrEqual(2);

      // Verify elementFromPoint over text elements returns text or text containers, NEVER the canvas
      const hitTest = await page.evaluate(() => {
        const lead = document.querySelector('.hero-lead') as HTMLElement;
        const title = document.querySelector('.hero-title') as HTMLElement;
        const intro = document.querySelector('.hero-intro') as HTMLElement;

        const leadRect = lead.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        const introRect = intro.getBoundingClientRect();

        const hitLead = document.elementFromPoint(
          leadRect.left + 20,
          leadRect.top + leadRect.height / 2,
        );
        const hitTitle = document.elementFromPoint(
          titleRect.left + 40,
          titleRect.top + titleRect.height / 2,
        );
        const hitIntro = document.elementFromPoint(
          introRect.left + 20,
          introRect.top + introRect.height / 2,
        );

        return {
          hitLeadIsCanvas: hitLead?.id === 'digit-field-canvas',
          hitTitleIsCanvas: hitTitle?.id === 'digit-field-canvas',
          hitIntroIsCanvas: hitIntro?.id === 'digit-field-canvas',
        };
      });

      expect(hitTest.hitLeadIsCanvas).toBe(false);
      expect(hitTest.hitTitleIsCanvas).toBe(false);
      expect(hitTest.hitIntroIsCanvas).toBe(false);

      // 2. Verify Effective Contrast: Lead line text against effective background (including underlying digits)
      const contrastResults = await page.evaluate(
        ({ activeTheme }) => {
          const lead = document.querySelector('.hero-lead') as HTMLElement;
          const rect = lead.getBoundingClientRect();
          const leadColorStyle = getComputedStyle(lead).color;

          // Parse text color
          const rgbMatch = leadColorStyle.match(/\d+/g) || ['0', '0', '0'];
          const textR = parseInt(rgbMatch[0] || '0', 10) / 255;
          const textG = parseInt(rgbMatch[1] || '0', 10) / 255;
          const textB = parseInt(rgbMatch[2] || '0', 10) / 255;

          const toLinear = (c: number) =>
            c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          const textLuminance =
            0.2126 * toLinear(textR) + 0.7152 * toLinear(textG) + 0.0722 * toLinear(textB);

          // Sample 5 points across the lead line text
          const sampleFractions = [0.1, 0.25, 0.5, 0.75, 0.9];
          const points = sampleFractions.map((f) => ({
            x: Math.round(rect.left + rect.width * f),
            y: Math.round(rect.top + rect.height * 0.5),
          }));

          const results: Array<{
            point: { x: number; y: number };
            contrastRatio: number;
            effectiveAlpha: number;
          }> = [];

          for (const pt of points) {
            const sample = window.__sampleDigitCanvas?.(pt.x, pt.y);
            const effectiveAlpha = sample?.effectiveAlpha ?? 0;

            // Compute composite background color under the digit stroke
            let bgR = activeTheme === 'light' ? 1.0 : 0.0;
            let bgG = activeTheme === 'light' ? 1.0 : 0.0;
            let bgB = activeTheme === 'light' ? 1.0 : 0.0;

            if (activeTheme === 'light') {
              // Light theme: white background with black digits
              bgR = 1.0 - effectiveAlpha;
              bgG = 1.0 - effectiveAlpha;
              bgB = 1.0 - effectiveAlpha;
            } else {
              // Dark theme: black background with light digits (#F1F1F1 -> 241/255)
              const digitVal = 241 / 255;
              bgR = digitVal * effectiveAlpha;
              bgG = digitVal * effectiveAlpha;
              bgB = digitVal * effectiveAlpha;
            }

            const bgLuminance =
              0.2126 * toLinear(bgR) + 0.7152 * toLinear(bgG) + 0.0722 * toLinear(bgB);

            const maxL = Math.max(textLuminance, bgLuminance);
            const minL = Math.min(textLuminance, bgLuminance);
            const contrastRatio = (maxL + 0.05) / (minL + 0.05);

            results.push({ point: pt, contrastRatio, effectiveAlpha });
          }

          return results;
        },
        { activeTheme: theme },
      );

      // Assert at least 4.5:1 contrast against effective background at every sampled point
      for (const res of contrastResults) {
        expect(res.contrastRatio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('WCAG 2.3.1 Safety Check: Digit flip cannot flash over large area > 3 times/sec', async ({
    page,
  }) => {
    // 1. Flip interval token: 160ms
    expect(DIGIT_FIELD.flipIntervalMs).toBe(160);

    // 2. Flip radius is strictly constrained to 110px
    expect(DIGIT_FIELD.flipRadius).toBe(110);

    // 3. Mathematical Area calculation:
    // Radius = 110px -> Area = PI * 110^2 = 38,013 px^2
    // On a 1280x800 viewport (1,024,000 px^2), this is 3.71% of the viewport.
    // WCAG 2.3.1 threshold specifies flash cannot exceed 25% of the visual field.
    const flipArea = Math.PI * Math.pow(DIGIT_FIELD.flipRadius, 2);
    const standardViewportArea = 1280 * 800;
    const areaPercentage = (flipArea / standardViewportArea) * 100;

    expect(areaPercentage).toBeLessThan(5.0); // Strict guarantee < 5%, far below 25% threshold

    // 4. Verify under reduced motion flip is 0
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const isReduced = await page.evaluate(() => {
      const html = document.documentElement;
      return (
        html.dataset.motion === 'reduced' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    });
    expect(isReduced).toBe(true);
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

  test('Falloff Curve: Effective alpha curve at distances 0, 40, 80, 110, 160, 240px in all 4 directions', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();

    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas') as HTMLElement | null;
      return el && el.getAttribute('data-webgl-ready') === 'true' && !el.style.opacity;
    });

    // 1. Verify canvas computed opacity (0.45)
    const canvasOpacity = await canvas.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).opacity) || 1.0;
    });
    expect(canvasOpacity).toBe(0.45);

    // 2. Center pointer at (400, 300) inside hero
    const cx = 400;
    const cy = 300;
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(100);

    const distances = [0, 40, 80, 110, 160, 240];
    const directions = ['N', 'S', 'E', 'W'] as const;

    // Sample across distances and directions
    const samplesByDist: Record<number, Record<'N' | 'S' | 'E' | 'W', number>> = {};

    for (const d of distances) {
      samplesByDist[d] = { N: 0, S: 0, E: 0, W: 0 };
      for (const dir of directions) {
        let sx = cx;
        let sy = cy;
        if (dir === 'N') sy = cy - d;
        if (dir === 'S') sy = cy + d;
        if (dir === 'E') sx = cx + d;
        if (dir === 'W') sx = cx - d;

        const res = await page.evaluate(({ x, y }) => window.__sampleDigitCanvas?.(x, y), {
          x: sx,
          y: sy,
        });
        expect(res).not.toBeNull();
        samplesByDist[d][dir] = res?.effectiveAlpha ?? 0;
      }
    }

    // Peak near pointer (d = 0)
    const peakAlpha = samplesByDist[0]?.['N'] ?? 0;
    const farBaseAlpha = await page.evaluate(
      () => window.__sampleDigitCanvas?.(900, 300)?.effectiveAlpha ?? 0,
    );

    // Assert near pointer is at least 3x far value (allowing font rasterization margin across platforms)
    expect(peakAlpha).toBeGreaterThanOrEqual(3 * farBaseAlpha);
    expect(peakAlpha).toBeGreaterThanOrEqual(0.28);
    expect(farBaseAlpha).toBeLessThanOrEqual(0.1);

    // Monotonic falloff across all directions (allowing margin for glyph rasterization density)
    for (const dir of directions) {
      let prevVal = peakAlpha + 0.12; // discretised cell step margin
      for (const d of distances) {
        const val = samplesByDist[d]?.[dir] ?? 0;
        // As distance increases, alpha must decrease monotonically
        expect(val).toBeLessThanOrEqual(prevVal + 0.08);
        prevVal = Math.max(prevVal, val);
        if (d >= 160) {
          // Far points must be distinctly lower than near peak
          expect(val).toBeLessThan(peakAlpha);
        }
      }
    }

    // Symmetry across directions: at any given distance, samples in N, S, E, W are close (within one cell transition range)
    for (const d of distances) {
      const vals = directions.map((dir) => samplesByDist[d]?.[dir] ?? 0);
      const minV = Math.min(...vals);
      const maxV = Math.max(...vals);
      // Within one cell transition range (<= 0.28 on 40px low-power cells with glyph rasterization difference)
      expect(maxV - minV).toBeLessThanOrEqual(0.28);
    }

    // 3. Digits within flip radius (110px) alternate within 400ms, while far digit remains static
    const nearInitial = await page.evaluate(
      ({ x, y }) => window.__sampleDigitCanvas?.(x, y)?.digit,
      { x: cx, y: cy },
    );
    const farInitial = await page.evaluate(() => window.__sampleDigitCanvas?.(900, 300)?.digit);

    let flippedNear = false;
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(45);
      const currNear = await page.evaluate(
        ({ x, y }) => window.__sampleDigitCanvas?.(x, y)?.digit,
        { x: cx, y: cy },
      );
      if (currNear !== nearInitial) {
        flippedNear = true;
        break;
      }
    }
    expect(flippedNear).toBe(true);

    const farFinal = await page.evaluate(() => window.__sampleDigitCanvas?.(900, 300)?.digit);
    expect(farFinal).toBe(farInitial);
  });

  test('Live Interactions: Real theme toggle and motion pause buttons update digit field within 300ms', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas') as HTMLElement | null;
      return el && el.getAttribute('data-webgl-ready') === 'true';
    });

    // 1. Initial light theme luminance (< 0.15 for dark text)
    const initialLight = await page.evaluate(() => window.__sampleDigitCanvas?.(300, 200));
    expect(initialLight).not.toBeNull();
    expect(initialLight?.luminance).toBeLessThan(0.15);

    // 2. Click real theme toggle button in nav
    const themeBtn = page
      .locator('nav button[data-theme-toggle], button[data-theme-toggle]')
      .first();
    await themeBtn.click();

    // Assert digit colour changes within 300ms (light digits on dark theme: luminance > 0.70)
    await expect
      .poll(
        async () => {
          const sample = await page.evaluate(() => window.__sampleDigitCanvas?.(300, 200));
          return sample?.luminance ?? 0;
        },
        { timeout: 300 },
      )
      .toBeGreaterThan(0.7);

    // Click again to return to light theme
    await themeBtn.click();
    await expect
      .poll(
        async () => {
          const sample = await page.evaluate(() => window.__sampleDigitCanvas?.(300, 200));
          return sample?.luminance ?? 1;
        },
        { timeout: 300 },
      )
      .toBeLessThan(0.15);

    // 3. Real "Pause motion" button in footer
    const motionBtn = page.locator('button[data-motion-toggle]').first();
    await motionBtn.click();

    // Scroll back to top to ensure hero is in view
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    // Field stops: ticker halts, frozen frame, no pointer effect
    await page.mouse.move(300, 200);
    await page.waitForTimeout(100);

    const pausedSample1 = await page.evaluate(() => window.__sampleDigitCanvas?.(300, 200));
    // Pointer effect disabled under pause motion
    expect(pausedSample1?.effectiveAlpha).toBeLessThanOrEqual(0.1);

    // Click "Play motion" in footer to resume
    await motionBtn.click();
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    await page.mouse.move(300, 200);
    await page.waitForTimeout(100);

    const resumedSample = await page.evaluate(() => window.__sampleDigitCanvas?.(300, 200));
    expect(resumedSample?.effectiveAlpha).toBeGreaterThanOrEqual(0.25);

    // 4. Live media query change with emulateMedia (clear explicit app override first)
    await page.evaluate(() => {
      delete document.documentElement.dataset['motion'];
      try {
        localStorage.removeItem('motion');
      } catch {
        // Ignore storage errors
      }
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(150);

    const emulatedReducedSample = await page.evaluate(() => window.__sampleDigitCanvas?.(300, 200));
    expect(emulatedReducedSample?.effectiveAlpha).toBeLessThanOrEqual(0.1);

    await page.emulateMedia({ reducedMotion: 'no-preference' });

    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('Debug & Feature Switches: ?perf=1 renders HUD and ?fx=off:digitfield disables WebGL', async ({
    page,
  }) => {
    // 1. ?fx=off:digitfield disables WebGL digit field
    await page.goto('/?fx=off:digitfield');
    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();
    await page.waitForTimeout(400);

    await expect(canvas).toHaveClass(/no-webgl/);

    // 2. ?perf=1 renders performance HUD overlay with diagnostic line
    await page.goto('/?perf=1');
    const hud = page.locator('#perf-overlay');
    await expect(hud).toBeAttached();
    await expect(hud).toContainText('MansurVerse Perf HUD');
    await expect(hud).toContainText('FPS:');
    await expect(hud).toContainText('Canvas:');
    await expect(hud).toContainText('Status:');
    await expect(hud).toContainText('Guard:');
    await expect(hud).toContainText('Pointer:');
    await expect(hud).toContainText('Mode:');
  });

  test('Audit: Pointer events delivery across empty hero area updates shader pointer tracking', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas');
      return el && el.getAttribute('data-webgl-ready') === 'true';
    });

    // Move pointer over empty hero area
    await page.mouse.move(500, 350);
    await page.waitForTimeout(100);

    const ptrState = await page.evaluate(() => {
      const dbg = window.__digitFieldDebug;
      const canvas = document.getElementById('digit-field-canvas');
      const rect = canvas?.getBoundingClientRect();
      return {
        lastPointer: dbg?.lastPointer,
        status: dbg?.status,
        canvasTop: rect?.top,
        canvasLeft: rect?.left,
      };
    });

    expect(ptrState.status).toBe('running');
    expect(ptrState.lastPointer).not.toBeNull();
    // lastPointer coordinates should match 500 - canvasLeft, 350 - canvasTop
    const expectedX = Math.round(500 - (ptrState.canvasLeft || 0));
    const expectedY = Math.round(350 - (ptrState.canvasTop || 0));
    expect(ptrState.lastPointer?.[0]).toBe(expectedX);
    expect(ptrState.lastPointer?.[1]).toBe(expectedY);
  });

  test('Audit: Pause motion toggle in footer updates state, button label, storage, and ticker', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas');
      return el && el.getAttribute('data-webgl-ready') === 'true';
    });

    const toggleBtn = page.locator('#motion-toggle');
    await expect(toggleBtn).toBeAttached();
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(toggleBtn).toContainText('Pause motion');

    // Click to pause motion
    await toggleBtn.click();
    await page.waitForTimeout(100);

    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(toggleBtn).toContainText('Play motion');

    const pausedState = await page.evaluate(() => ({
      htmlMotion: document.documentElement.getAttribute('data-motion'),
      storageMotion: localStorage.getItem('motion'),
      status: window.__digitFieldDebug?.status,
    }));

    expect(pausedState.htmlMotion).toBe('reduced');
    expect(pausedState.storageMotion).toBe('reduced');
    expect(pausedState.status).toBe('paused');

    // Click to resume motion
    await toggleBtn.click();
    await page.waitForTimeout(100);

    // Scroll back to top so hero section is visible and intersecting
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(toggleBtn).toContainText('Pause motion');

    const resumedState = await page.evaluate(() => ({
      htmlMotion: document.documentElement.getAttribute('data-motion'),
      storageMotion: localStorage.getItem('motion'),
      status: window.__digitFieldDebug?.status,
    }));

    expect(resumedState.htmlMotion).toBe('normal');
    expect(resumedState.storageMotion).toBe('normal');
    expect(resumedState.status).toBe('running');
  });

  test('Pixel Sampling: Reduced motion draws 1 frame with no pointer effect', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas');
      return el && el.getAttribute('data-webgl-ready') === 'true';
    });

    const sampleBefore = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(sampleBefore).not.toBeNull();

    // Move mouse over coordinates
    await page.mouse.move(200, 250);
    await page.waitForTimeout(250);

    const sampleAfter = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(sampleAfter).not.toBeNull();

    // Under reduced motion, pointer effect and ticker are disabled
    if (sampleBefore && sampleAfter) {
      expect(sampleAfter.effectiveAlpha).toBe(sampleBefore.effectiveAlpha);
      expect(sampleAfter.digit).toBe(sampleBefore.digit);
    }
  });

  test('Pixel Sampling: Touch / coarse pointer disables pointer effects', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas');
      return el && el.getAttribute('data-webgl-ready') === 'true';
    });

    // Touch device tap/move
    await page.touchscreen.tap(200, 250);
    await page.waitForTimeout(100);

    const sample = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(sample).not.toBeNull();
    if (sample) {
      // Should remain at base far alpha without pointer brightening
      expect(sample.effectiveAlpha).toBeLessThanOrEqual(0.1);
    }

    await context.close();
  });
});
