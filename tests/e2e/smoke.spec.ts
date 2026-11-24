import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/work', '/work/project-one', '/about', '/contact', '/404'];

test.describe('Production Smoke Suite', () => {
  // 1. Every route loads without console errors or unhandled rejections, in light and dark themes at DPR 1 and 2
  for (const dpr of [1, 2]) {
    for (const theme of ['light', 'dark'] as const) {
      test(`Routes load cleanly at DPR ${dpr} in ${theme} theme`, async ({ browser }) => {
        const context = await browser.newContext({
          deviceScaleFactor: dpr,
          viewport: { width: 1280, height: 800 },
        });

        for (const route of ROUTES) {
          const page = await context.newPage();
          const errors: string[] = [];

          page.on('console', (msg) => {
            if (msg.type() === 'error') {
              errors.push(`[Console Error on ${route}] ${msg.text()}`);
            }
          });

          page.on('pageerror', (err) => {
            errors.push(`[Unhandled Rejection on ${route}] ${err.message}`);
          });

          // Pre-set theme in localStorage
          await page.addInitScript((th) => {
            try {
              localStorage.setItem('theme', th);
            } catch {
              // ignore
            }
          }, theme);

          const response = await page.goto(route, { waitUntil: 'load' });
          expect([200, 404]).toContain(response?.status());

          // Ensure main layout is rendered
          await expect(page.locator('main')).toBeAttached();
          const htmlTheme = await page.evaluate(() => document.documentElement.dataset.theme);
          expect(htmlTheme).toBe(theme);

          expect(errors).toEqual([]);
          await page.close();
        }

        await context.close();
      });
    }
  }

  // 2. Pause motion button changes label, aria-pressed, data-motion on <html>, and localStorage on click and reverts on second click
  test('Pause motion button respects stored reduced motion preference on initial load', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('motion', 'reduced');
    });
    await page.goto('/');

    const toggle = page.locator('#motion-toggle').first();
    await expect(toggle).toBeVisible();

    const pauseLabel = toggle.locator('.motion-label-pause');
    const playLabel = toggle.locator('.motion-label-play');

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(pauseLabel).toBeHidden();
    await expect(playLabel).toBeVisible();
  });

  test('Pause motion button toggles state, labels, aria-pressed, and storage', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#motion-toggle').first();
    await expect(toggle).toBeVisible();

    const pauseLabel = toggle.locator('.motion-label-pause');
    const playLabel = toggle.locator('.motion-label-play');

    // Initial state: not reduced motion
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(pauseLabel).toBeVisible();
    await expect(playLabel).toBeHidden();

    // First click: activate reduced motion
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(pauseLabel).toBeHidden();
    await expect(playLabel).toBeVisible();

    const htmlMotionReduced = await page.evaluate(() => document.documentElement.dataset.motion);
    expect(htmlMotionReduced).toBe('reduced');

    const storageReduced = await page.evaluate(() => localStorage.getItem('motion'));
    expect(storageReduced).toBe('reduced');

    // Second click: revert to normal motion
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(pauseLabel).toBeVisible();
    await expect(playLabel).toBeHidden();

    const htmlMotionNormal = await page.evaluate(() => document.documentElement.dataset.motion);
    expect(htmlMotionNormal).toBe('normal');

    const storageNormal = await page.evaluate(() => localStorage.getItem('motion'));
    expect(storageNormal).toBe('normal');
  });

  // 3. Theme toggle changes data-theme
  test('Theme toggle changes data-theme and updates localStorage', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('#theme-toggle').first();
    await expect(themeToggle).toBeVisible();

    const initialTheme = await page.evaluate(
      () => document.documentElement.dataset.theme || 'light',
    );
    const expectedToggledTheme = initialTheme === 'dark' ? 'light' : 'dark';

    await themeToggle.click();

    await page.waitForFunction(
      (expected) => document.documentElement.dataset.theme === expected,
      expectedToggledTheme,
    );

    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(expectedToggledTheme);

    // Toggle back
    await themeToggle.click();

    await page.waitForFunction(
      (expected) => document.documentElement.dataset.theme === expected,
      initialTheme,
    );
    const restoredTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(restoredTheme).toBe(initialTheme);
  });

  // 4. Navigation between routes with client router leaves no errors, keeps Nav and Footer, and moves focus to h1
  test('ClientRouter navigation keeps Nav/Footer, focuses h1, and causes no errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`[Navigation Console Error] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`[Navigation Unhandled Error] ${err.message}`);
    });

    await page.goto('/');
    await expect(page.locator('.nav-desktop')).toBeAttached();
    await expect(page.locator('footer')).toBeAttached();

    // 1. Navigate to /work
    await page.click('nav a[href="/work"]');
    await expect(page).toHaveURL(/\/work/);
    await expect(page.locator('.nav-desktop')).toBeAttached();
    await expect(page.locator('footer')).toBeAttached();

    await page.waitForFunction(() => {
      const active = document.activeElement;
      return active?.tagName.toLowerCase() === 'h1';
    });
    const workActiveTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(workActiveTag).toBe('h1');

    // 2. Navigate to /about
    await page.click('nav a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('.nav-desktop')).toBeAttached();
    await expect(page.locator('footer')).toBeAttached();

    await page.waitForFunction(() => {
      const active = document.activeElement;
      return active?.tagName.toLowerCase() === 'h1';
    });
    const aboutActiveTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(aboutActiveTag).toBe('h1');

    // 3. Navigate to /contact
    await page.click('nav a[href="/contact"]');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('.nav-desktop')).toBeAttached();
    await expect(page.locator('footer')).toBeAttached();

    await page.waitForFunction(() => {
      const active = document.activeElement;
      return active?.tagName.toLowerCase() === 'h1';
    });
    const contactActiveTag = await page.evaluate(() =>
      document.activeElement?.tagName.toLowerCase(),
    );
    expect(contactActiveTag).toBe('h1');

    expect(errors).toEqual([]);
  });

  // 6. Phase 5d Page Interactions smoke checks
  test('Phase 5d page interactions render cleanly and interact without errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[Smoke Error] ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`[Smoke Exception] ${err.message}`));

    // Work page
    await page.goto('/work');
    const filterChip = page.locator('[data-filter-chip]').first();
    await expect(filterChip).toBeVisible();
    await filterChip.click();

    const viewToggle = page.locator('[data-view-toggle="list"]');
    await expect(viewToggle).toBeVisible();
    await viewToggle.click();

    // Case study
    await page.goto('/work/project-one');
    const compareSlider = page.locator('.compare-slider');
    await expect(compareSlider).toBeVisible();

    // About page
    await page.goto('/about');
    const portrait = page.locator('.about-portrait-wrapper');
    await expect(portrait).toBeVisible();

    // Contact page
    await page.goto('/contact');
    const form = page.locator('.contact-form');
    await expect(form).toBeVisible();

    expect(errors).toEqual([]);
  });

  // 7. Production layout invariants on Home page per ollyo.com layout reference
  test('Home page satisfies production layout invariants and padding geometry', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const check = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>('.hero-section');
      const heroComp = hero ? getComputedStyle(hero) : null;
      const heroPadTop = heroComp ? parseFloat(heroComp.paddingTop) : 0;
      const heroPadBottom = heroComp ? parseFloat(heroComp.paddingBottom) : 0;

      const heroLead = document.querySelector<HTMLElement>('.hero-lead');
      const heroLeadTop = heroLead ? heroLead.getBoundingClientRect().top : 0;

      // Capabilities closed on load
      const capRows = Array.from(
        document.querySelectorAll<HTMLDetailsElement>('details.capability-row'),
      );
      const allCapClosed = capRows.every((r) => !r.open && !r.classList.contains('is-expanded'));

      // Statement width & height
      const stmt = document.querySelector<HTMLElement>('.statement-container');
      const stmtRect = stmt ? stmt.getBoundingClientRect() : null;

      return {
        heroPadTop,
        heroPadBottom,
        heroLeadTop,
        allCapClosed,
        stmtRect: stmtRect ? { width: stmtRect.width, height: stmtRect.height } : null,
      };
    });

    // Distance from top of page to first hero line = 200px (desktop)
    expect(
      Math.abs(check.heroLeadTop - 200),
      `Hero lead top position (${check.heroLeadTop}) should be 200px per ollyo reference`,
    ).toBeLessThanOrEqual(5.5);

    // Hero bottom padding = 120px
    expect(
      Math.abs(check.heroPadBottom - 120),
      `Hero bottom padding (${check.heroPadBottom}) should match --layout-hero-bottom (120px)`,
    ).toBeLessThanOrEqual(2);

    expect(check.allCapClosed, 'Capability rows must be closed on initial load').toBe(true);

    if (check.stmtRect) {
      expect(
        check.stmtRect.height,
        `Statement height (${check.stmtRect.height}px) must be below 600px`,
      ).toBeLessThan(600);
    }
  });
});
