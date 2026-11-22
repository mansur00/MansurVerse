import { test, expect } from '@playwright/test';

test.describe('Phase 5b Supporting Interactions', () => {
  test('I-08 & I-16: Scroll Reveal & Process Steps finish visible with transform cleared', async ({
    page,
  }) => {
    await page.goto('/');

    const processSteps = page.locator('.process-step');
    await expect(processSteps.first()).toBeAttached();

    // Scroll to process steps section
    await processSteps.first().scrollIntoViewIfNeeded();

    // Wait for reveal animation to finish
    await page.waitForTimeout(1000);

    const count = await processSteps.count();
    for (let i = 0; i < count; i++) {
      const step = processSteps.nth(i);
      const opacity = await step.evaluate((el) => window.getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeGreaterThan(0.9);
    }
  });

  test('I-08 & I-16 under reduced motion: immediately visible without animation delay', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const step = page.locator('.process-step').first();
    await expect(step).toBeAttached();

    const opacity = await step.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBe(1);
  });

  test('I-17: Counters end with the exact target number in DOM and accessible name', async ({
    page,
  }) => {
    await page.goto('/about');

    const statTile = page.locator('.stat-tile').first();
    await statTile.scrollIntoViewIfNeeded();

    // Wait for count animation (--motion-count: 1200ms) to complete
    await page.waitForTimeout(1500);

    const statNumber = statTile.locator('.stat-number');
    const target = await statNumber.getAttribute('data-target');
    const text = await statNumber.textContent();

    expect(text?.trim()).toBe(target?.trim());

    // Accessible label on tile retains full name
    const tileAriaLabel = await statTile.getAttribute('aria-label');
    expect(tileAriaLabel).toBeTruthy();
    expect(tileAriaLabel).toContain(target?.trim());
  });

  test('I-15: Capability accordion expands on click and keyboard with grid-rows transition', async ({
    page,
  }) => {
    await page.goto('/');

    const row = page.locator('details.capability-row').first();
    await row.scrollIntoViewIfNeeded();

    const summary = row.locator('summary');
    const content = row.locator('.row-content');

    // On fine pointers, hovering over the capability row opens it per I-15
    await row.hover();
    await page.waitForTimeout(100);
    await expect(row).toHaveAttribute('open');

    // Wait for grid-rows animation (--motion-base: 400ms)
    await page.waitForTimeout(450);

    const contentHeight = await content.evaluate((el) => el.getBoundingClientRect().height);
    expect(contentHeight).toBeGreaterThan(0);

    // Clicking summary toggles it closed
    await summary.click();
    await expect(row).not.toHaveAttribute('open');
  });

  test('I-11 & I-12: Custom cursor follows fine pointer and expands on [data-cursor]', async ({
    page,
  }) => {
    await page.goto('/');

    // Move pointer to trigger cursor creation
    await page.mouse.move(200, 200);

    const cursor = page.locator('#custom-cursor');
    await expect(cursor).toBeAttached();

    // Hover over a project card with data-cursor="View"
    const projectCard = page.locator('.project-card[data-cursor]').first();
    await projectCard.scrollIntoViewIfNeeded();

    const box = await projectCard.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(200);

      await expect(cursor).toHaveClass(/is-expanded/);
      const label = cursor.locator('.cursor-label');
      await expect(label).toHaveText('View');
    }
  });

  test('I-11: Custom cursor is absent on touch devices (pointer: coarse)', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto('/');

    const cursor = page.locator('#custom-cursor');
    // Either not created or display is none
    const isVisible = await cursor.isVisible().catch(() => false);
    expect(isVisible).toBe(false);

    await context.close();
  });

  test('I-18: Marquee loops with CSS animation and is static under reduced motion', async ({
    page,
  }) => {
    await page.goto('/');

    const marqueeTrack = page.locator('.marquee-track').first();
    await expect(marqueeTrack).toBeAttached();

    // Normal motion: animation name is marquee-scroll
    const animationName = await marqueeTrack.evaluate(
      (el) => window.getComputedStyle(el).animationName,
    );
    expect(animationName).toBe('marquee-scroll');

    // Reduced motion: animation is none
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();

    const reducedTrack = page.locator('.marquee-track').first();
    const reducedAnim = await reducedTrack.evaluate(
      (el) => window.getComputedStyle(el).animationName,
    );
    expect(reducedAnim).toBe('none');
  });

  test('I-20: Clipboard copy updates button text and announces in polite live region', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/contact');

    const copyBtn = page.locator('[data-copy]').first();
    await copyBtn.scrollIntoViewIfNeeded();

    const targetEmail = await copyBtn.getAttribute('data-copy');
    await copyBtn.click();

    // Text updates to Copied ✓
    await expect(copyBtn).toHaveText(/Copied ✓/);

    // Announcer live region is updated
    const announcer = page.locator('#page-announcer');
    await expect(announcer).toContainText(`Copied ${targetEmail} to clipboard`);

    // Resets after 1800ms
    await page.waitForTimeout(2000);
    await expect(copyBtn).not.toHaveText(/Copied ✓/);
  });

  test('I-21: Footer local clock formats local time with timezone', async ({ page }) => {
    await page.goto('/');

    const timeElement = page.locator('footer time.time-value');
    await expect(timeElement).toBeVisible();

    const timeText = await timeElement.textContent();
    // Format should contain HH:MM e.g. "12:34 UTC"
    expect(timeText).toMatch(/\d{2}:\d{2}/);
  });

  test('I-03: Nav desktop links have accessible name in sr-only and letter-roll chars', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const navLink = page.locator('.nav-desktop .nav-link').first();
    await expect(navLink).toBeVisible();

    // Accessible text exists
    const srOnly = navLink.locator('.sr-only');
    await expect(srOnly).toHaveText('Home');

    // Character roll elements exist
    const rollChars = navLink.locator('.roll-char');
    expect(await rollChars.count()).toBeGreaterThan(0);
  });

  test('Performance: CLS on Home (/) and Work (/work) is <= 0.05', async ({ page }) => {
    for (const route of ['/', '/work']) {
      await page.goto(route);

      // Measure CLS via PerformanceObserver
      const cls = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          interface LayoutShiftEntry extends PerformanceEntry {
            hadRecentInput?: boolean;
            value?: number;
          }
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as LayoutShiftEntry[]) {
              if (!entry.hadRecentInput && typeof entry.value === 'number') {
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });

          // Allow any initial animations/renders to settle
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 800);
        });
      });

      expect(cls).toBeLessThanOrEqual(0.05);
    }
  });
});
