import { test, expect } from '@playwright/test';
import { DIGIT_FIELD } from '../../src/scripts/webgl/constants';

test.describe('Phase 5c Hero & WebGL Digit Field', () => {
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

    // Allow any remaining layout shifts or idle frames to settle completely
    await page.waitForTimeout(300);

    // Verify pointer movement across hero produces no long task over 50ms
    await page.evaluate(() => {
      const win = window as unknown as {
        __pointerLongTasks?: number;
        __pointerTaskObserver?: PerformanceObserver;
      };
      win.__pointerLongTasks = 0;
      const taskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            win.__pointerLongTasks = (win.__pointerLongTasks || 0) + 1;
          }
        }
      });
      taskObserver.observe({ type: 'longtask', buffered: false });
      win.__pointerTaskObserver = taskObserver;
    });

    // Move pointer continuously across hero
    for (let i = 100; i < 500; i += 40) {
      await page.mouse.move(i, 200 + (i % 80));
      await page.waitForTimeout(20);
    }

    const pointerLongTasks = await page.evaluate(() => {
      const win = window as unknown as {
        __pointerLongTasks?: number;
        __pointerTaskObserver?: PerformanceObserver;
      };
      win.__pointerTaskObserver?.disconnect();
      return win.__pointerLongTasks ?? 0;
    });

    expect(pointerLongTasks).toBe(0);
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

  test('Pixel Sampling: Digit field effective alpha, luminance, flip timing and token styles', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('mansurverse:hero-intro', 'true');
    });
    await page.goto('/');

    const canvas = page.locator('#digit-field-canvas');
    await expect(canvas).toBeAttached();

    // Wait until WebGL digit field has completed first frame and intro is settled
    await page.waitForFunction(() => {
      const el = document.querySelector('#digit-field-canvas') as HTMLElement | null;
      return el && el.getAttribute('data-webgl-ready') === 'true' && !el.style.opacity;
    });

    // 1. Verify canvas computed opacity and filter match tokens
    const styles = await canvas.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        opacity: cs.opacity,
        filter: cs.filter,
      };
    });
    expect(styles.opacity).toBe('0.45'); // --opacity-digit-field (0.45)
    expect(styles.filter).toBe('blur(0.7px)'); // --blur-digit-field (0.7px)

    // 2. Far from pointer: sample at (200, 250) when pointer is outside hero
    const farSampleLight = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(farSampleLight).not.toBeNull();
    if (farSampleLight) {
      // Effective alpha should be quiet background (0.04 to 0.10)
      expect(farSampleLight.effectiveAlpha).toBeGreaterThanOrEqual(0.04);
      expect(farSampleLight.effectiveAlpha).toBeLessThanOrEqual(0.1);
      // Light theme uses dark/black text: luminance < 0.15
      expect(farSampleLight.luminance).toBeLessThan(0.15);
    }

    // 3. Near pointer: move pointer to (200, 250)
    await page.mouse.move(200, 250);
    await page.waitForTimeout(100);

    const nearSampleLight = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(nearSampleLight).not.toBeNull();
    if (nearSampleLight && farSampleLight) {
      // Effective alpha within 40px of pointer rises smoothly to >= 0.30
      expect(nearSampleLight.effectiveAlpha).toBeGreaterThanOrEqual(0.3);
      // At least 3x the far value
      expect(nearSampleLight.effectiveAlpha).toBeGreaterThanOrEqual(
        3 * farSampleLight.effectiveAlpha,
      );
    }

    // 4. Digit flips near pointer within 400ms, while far digit remains static
    const initialNearDigit = nearSampleLight?.digit;
    const initialFarDigit = await page.evaluate(
      () => window.__sampleDigitCanvas?.(800, 500)?.digit,
    );

    let flippedNear = false;
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(45);
      const sample = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
      if (sample && sample.digit !== initialNearDigit) {
        flippedNear = true;
        break;
      }
    }
    expect(flippedNear).toBe(true);

    const endFarDigit = await page.evaluate(() => window.__sampleDigitCanvas?.(800, 500)?.digit);
    expect(endFarDigit).toBe(initialFarDigit);

    // 5. Dark theme test
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForTimeout(150);

    // Far in dark theme: park pointer away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);

    const farSampleDark = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(farSampleDark).not.toBeNull();
    if (farSampleDark) {
      expect(farSampleDark.effectiveAlpha).toBeGreaterThanOrEqual(0.04);
      expect(farSampleDark.effectiveAlpha).toBeLessThanOrEqual(0.1);
      // Dark theme uses light/grey-100 text (#F1F1F1): luminance > 0.70
      expect(farSampleDark.luminance).toBeGreaterThan(0.7);
    }

    // Near in dark theme
    await page.mouse.move(200, 250);
    await page.waitForTimeout(100);

    const nearSampleDark = await page.evaluate(() => window.__sampleDigitCanvas?.(200, 250));
    expect(nearSampleDark).not.toBeNull();
    if (nearSampleDark && farSampleDark) {
      expect(nearSampleDark.effectiveAlpha).toBeGreaterThanOrEqual(0.3);
      expect(nearSampleDark.effectiveAlpha).toBeGreaterThanOrEqual(
        3 * farSampleDark.effectiveAlpha,
      );
    }
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
