import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const routes = ['/', '/work', '/work/project-one', '/about', '/contact', '/404'];

test.describe('JavaScript Disabled Suite', () => {
  for (const path of routes) {
    test(`renders correctly with JS disabled on ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Verify content is visible and main heading exists
      await expect(page.locator('h1')).toBeVisible();

      // Verify skip link exists
      const skipLink = page.locator('a.skip-link');
      await expect(skipLink).toBeAttached();

      // Verify no horizontal overflow at 375px
      await page.setViewportSize({ width: 375, height: 667 });
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test('renders 404 status on unknown path with JS disabled', async ({ page }) => {
    const response = await page.goto('/unknown-no-js-route');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('404');
  });
});
