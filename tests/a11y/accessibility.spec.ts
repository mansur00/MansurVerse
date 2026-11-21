import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToTest = ['/', '/work', '/work/project-one', '/about', '/contact', '/404'];
const themes = ['light', 'dark'];

test.describe('Accessibility (axe-core WCAG 2.2 AA)', () => {
  for (const pagePath of pagesToTest) {
    for (const theme of themes) {
      test(`${pagePath} in ${theme} theme has zero axe violations`, async ({ page }) => {
        await page.addInitScript((t) => {
          try {
            localStorage.setItem('theme', t);
          } catch {}
        }, theme);
        await page.goto(pagePath);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  }
});
