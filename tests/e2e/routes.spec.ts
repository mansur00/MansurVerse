import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', title: 'MansurVerse' },
  { path: '/work', title: 'Work' },
  { path: '/work/project-one', title: 'Project One' },
  { path: '/work/project-two', title: 'Project Two' },
  { path: '/work/project-three', title: 'Project Three' },
  { path: '/work/project-four', title: 'Project Four' },
  { path: '/work/project-five', title: 'Project Five' },
  { path: '/work/project-six', title: 'Project Six' },
  { path: '/about', title: 'About' },
  { path: '/contact', title: 'Contact' },
];

test.describe('Routes & Metadata', () => {
  for (const { path, title } of routes) {
    test(`route ${path} returns 200, correct title, and canonical`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Verify page title
      await expect(page).toHaveTitle(new RegExp(title));

      // Verify canonical URL
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const canonicalHref = await canonical.getAttribute('href');
      expect(canonicalHref).toContain(path === '/' ? '' : path);
    });
  }

  test('404 for unknown path returns 404 status and content', async ({ page }) => {
    const response = await page.goto('/unknown-page-path-12345');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('404');
  });

  test('404 page directly returns content with 404 heading', async ({ page }) => {
    const response = await page.goto('/404');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('404');
  });
});

test.describe('Navigation', () => {
  test('nav links navigate correctly', async ({ page }) => {
    await page.goto('/');

    await page.click('nav a[href="/work"]');
    await expect(page).toHaveURL(/\/work/);

    await page.click('nav a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);

    await page.click('nav a[href="/contact"]');
    await expect(page).toHaveURL(/\/contact/);
  });
});

test.describe('Theme Toggle & Persistence', () => {
  test('toggle switches theme and persists in storage', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.locator('button[aria-label*="theme" i], button.theme-toggle');
    await expect(toggle.first()).toBeVisible();

    // Read initial theme (default is light if unset)
    const initialTheme = (await html.getAttribute('data-theme')) ?? 'light';
    const expectedToggled = initialTheme === 'dark' ? 'light' : 'dark';

    // Click toggle
    await toggle.first().click();

    await expect(html).toHaveAttribute('data-theme', expectedToggled);

    // Reload page to verify persistence
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', expectedToggled);
  });
});

test.describe('Responsive & Viewport (375px)', () => {
  for (const { path } of routes) {
    test(`no horizontal scroll at 375px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(path);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
