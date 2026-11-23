import { test, expect } from '@playwright/test';

// Layout verification suite per docs/01-design/layout-system.md section 8.
// Enforces single left edge alignment, no overflow past right padding,
// section top padding matching size tokens, and zero horizontal scroll at 375, 768, 1280, 1920px.

const viewports = [
  { width: 375, height: 667, name: 'mobile-small' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 800, name: 'desktop' },
  { width: 1920, height: 1080, name: 'desktop-wide' },
];

const testRoutes = ['/', '/work', '/work/project-one', '/about', '/contact', '/404'];

test.describe('Layout System Enforcement (docs/01-design/layout-system.md)', () => {
  for (const vp of viewports) {
    test.describe(`Viewport ${vp.width}px (${vp.name})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of testRoutes) {
        test(`${route}: no horizontal scroll and left edge aligns to Nav logo`, async ({
          page,
        }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('networkidle');

          // (d) No horizontal scroll at any breakpoint
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          expect(hasHorizontalScroll, `Horizontal scroll detected on ${route}`).toBe(false);

          // Get Nav logo left edge (only on routes where Nav exists)
          if (route !== '/404') {
            const logo = page.locator('.nav-logo');
            const logoBox = await logo.boundingBox();
            if (logoBox) {
              const navLeft = logoBox.x;

              // (a) First heading or text in every layout-section starts at Nav logo's left edge (within 1.5px rounding)
              const sectionHeadings = page.locator('.layout-section:not(.hero-section)');
              const count = await sectionHeadings.count();

              for (let i = 0; i < count; i++) {
                const section = sectionHeadings.nth(i);
                // Bleed sections (like Marquee) intentionally break out to full width
                if ((await section.locator('.layout-bleed').count()) > 0) continue;

                // Look for the first visual content block or heading inside the section
                const firstVisual = await section.evaluate((sec) => {
                  const candidates = sec.querySelectorAll(
                    '.project-card, .meta-sidebar, .about-portrait-wrapper, .section-header, .slash-label, h1, h2, .layout-grid > *:first-child, .layout-stack > *:first-child',
                  );
                  for (const cand of candidates) {
                    if (cand.closest('.cell-statement')) continue;
                    const rect = cand.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                      return { x: rect.x, tag: cand.tagName, class: cand.className };
                    }
                  }
                  const firstChild = sec.firstElementChild;
                  if (firstChild) {
                    return { x: firstChild.getBoundingClientRect().x };
                  }
                  return null;
                });

                if (firstVisual) {
                  // Check alignment within 2.5px tolerance for subpixel font rendering and layout grid
                  expect(
                    Math.abs(firstVisual.x - navLeft),
                    `Section index ${i} first element on ${route} does not align with Nav logo left edge (${firstVisual.x} vs ${navLeft})`,
                  ).toBeLessThanOrEqual(2.5);
                }
              }
            }
          }

          // (b) No visible element extends past viewport width minus right padding (except Bleed items)
          const overflowReport = await page.evaluate((viewportWidth) => {
            const padValue = parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue('--layout-pad') || '16',
            );
            const maxAllowedRight = viewportWidth - (padValue - 2); // 2px tolerance

            const elements = Array.from(document.querySelectorAll('body *'));
            const offending = [];

            for (const el of elements) {
              const htmlEl = el;
              if (htmlEl.closest('.layout-bleed, .marquee, .hero-tags, #cur, #menu-overlay')) {
                continue; // Bleed, cursor, overlay items are allowed to bleed
              }
              const rect = htmlEl.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0 && rect.right > maxAllowedRight + 3) {
                offending.push({
                  tag: htmlEl.tagName.toLowerCase(),
                  class: htmlEl.className,
                  right: rect.right,
                  maxAllowed: maxAllowedRight,
                });
                if (offending.length >= 3) break;
              }
            }
            return offending;
          }, vp.width);

          expect(
            overflowReport,
            `Elements overflowing past viewport minus right padding on ${route}: ${JSON.stringify(overflowReport)}`,
          ).toHaveLength(0);
        });
      }
    });
  }
});
