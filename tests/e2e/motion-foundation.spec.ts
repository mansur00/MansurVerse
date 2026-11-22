import { test, expect } from '@playwright/test';

test.describe('I-37 Motion Toggle & Persistence', () => {
  test('toggle switches motion preference and persists in storage', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const motionToggle = page.locator('#motion-toggle');
    await expect(motionToggle).toBeVisible();

    // Default state: not reduced motion
    const initialAttr = await html.getAttribute('data-motion');
    expect(initialAttr).not.toBe('reduced');
    await expect(motionToggle).toHaveAttribute('aria-pressed', 'false');

    // Click toggle to enable reduced motion
    await motionToggle.click();
    await expect(html).toHaveAttribute('data-motion', 'reduced');
    await expect(motionToggle).toHaveAttribute('aria-pressed', 'true');

    // Verify localStorage persistence
    const stored = await page.evaluate(() => localStorage.getItem('motion'));
    expect(stored).toBe('reduced');

    // Reload page and verify persistence across reload
    await page.reload();
    await expect(html).toHaveAttribute('data-motion', 'reduced');
    await expect(motionToggle).toHaveAttribute('aria-pressed', 'true');

    // Toggle back to normal motion
    await motionToggle.click();
    await expect(html).toHaveAttribute('data-motion', 'normal');
    await expect(motionToggle).toHaveAttribute('aria-pressed', 'false');

    const storedNormal = await page.evaluate(() => localStorage.getItem('motion'));
    expect(storedNormal).toBe('normal');
  });

  test('starts from OS prefers-reduced-motion when unset', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const html = page.locator('html');
    const motionToggle = page.locator('#motion-toggle');

    await expect(html).toHaveAttribute('data-motion', 'reduced');
    await expect(motionToggle).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('I-03 Mobile MenuOverlay Behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('menu opens, traps focus, closes with Escape and restores focus', async ({ page }) => {
    await page.goto('/');

    const openButton = page.locator('#menu-open-button');
    const overlay = page.locator('#menu-overlay');
    const closeButton = page.locator('#menu-close');

    await expect(openButton).toBeVisible();
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    await openButton.click();

    await expect(overlay).toHaveClass(/is-open/);
    await expect(overlay).toHaveAttribute('aria-hidden', 'false');
    await expect(openButton).toHaveAttribute('aria-expanded', 'true');

    // Close button should be focused
    await expect(closeButton).toBeFocused();

    // Focus trap test: Shift+Tab from close button wraps to last link
    await page.keyboard.press('Shift+Tab');
    const navLinks = overlay.locator('a');
    const lastLink = navLinks.last();
    await expect(lastLink).toBeFocused();

    // Tab from last link wraps back to close button
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();

    // Escape key closes menu and restores focus to openButton
    await page.keyboard.press('Escape');

    await expect(overlay).not.toHaveClass(/is-open/);
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');
    await expect(openButton).toBeFocused();
  });

  test('clicking close button closes menu and restores focus', async ({ page }) => {
    await page.goto('/');

    const openButton = page.locator('#menu-open-button');
    const overlay = page.locator('#menu-overlay');
    const closeButton = page.locator('#menu-close');

    await openButton.click();
    await expect(overlay).toHaveClass(/is-open/);

    await closeButton.click();
    await expect(overlay).not.toHaveClass(/is-open/);
    await expect(openButton).toBeFocused();
  });
});

test.describe('I-02 Nav Hide and Show on Scroll', () => {
  test('nav hides past 120px scrolling down, returns on scroll up and when focused', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const nav = page.locator('.nav-header');
    await expect(nav).toBeVisible();
    await expect(nav).not.toHaveClass(/is-hidden/);

    // Scroll down to 300px (past 120px threshold)
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(100);
    await expect(nav).toHaveClass(/is-hidden/);

    // Scroll up slightly (from 300px to 200px)
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(100);
    await expect(nav).not.toHaveClass(/is-hidden/);

    // Scroll down again past 120px
    await page.evaluate(() => window.scrollTo(0, 450));
    await page.waitForTimeout(100);
    await expect(nav).toHaveClass(/is-hidden/);

    // Focusing element inside nav reveals it immediately
    await page.focus('nav a[href="/work"]');
    await page.waitForTimeout(100);
    await expect(nav).not.toHaveClass(/is-hidden/);

    // Return to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await expect(nav).not.toHaveClass(/is-hidden/);
  });

  test('nav does not hide under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const nav = page.locator('.nav-header');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(100);
    await expect(nav).not.toHaveClass(/is-hidden/);
  });
});

test.describe('I-34 Route Transitions & Accessibility', () => {
  test('navigation updates url, moves focus to h1, and announces title in live region', async ({
    page,
  }) => {
    await page.goto('/');

    const announcer = page.locator('#page-announcer');
    await expect(announcer).toBeAttached();

    // Click link to Work page
    await page.click('nav a[href="/work"]');
    await expect(page).toHaveURL(/\/work/);

    // Focus moved to page h1 with tabindex="-1"
    const h1 = page.locator('main h1, h1').first();
    await expect(h1).toBeFocused();
    await expect(h1).toHaveAttribute('tabindex', '-1');

    // Title announced in polite live region
    await expect(announcer).toContainText('Work');

    // Navigate to About
    await page.click('nav a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);

    const aboutH1 = page.locator('main h1, h1').first();
    await expect(aboutH1).toBeFocused();
    await expect(announcer).toContainText('About');
  });

  test('navigation functions with reduced motion enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await page.click('nav a[href="/contact"]');
    await expect(page).toHaveURL(/\/contact/);

    const contactH1 = page.locator('main h1, h1').first();
    await expect(contactH1).toBeFocused();

    const announcer = page.locator('#page-announcer');
    await expect(announcer).toContainText('Contact');
  });
});
