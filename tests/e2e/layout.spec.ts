import { test, expect } from '@playwright/test';

// Layout verification suite per docs/01-design/layout-system.md section 8.
// Enforces single left edge alignment, no overflow past right padding,
// section top padding matching size tokens, cards/tiles geometry,
// statement proportions, and zero horizontal scroll at 375, 768, 1280, 1440, 1920px.

const viewports = [
  { width: 375, height: 667, name: 'mobile-small' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 800, name: 'desktop' },
  { width: 1440, height: 900, name: 'desktop-standard' },
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

          // 1. (d) No horizontal scroll at any breakpoint
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

              // 2. (a) First heading or text in every layout-section starts at Nav logo's left edge (within 2.5px tolerance)
              const sectionHeadings = page.locator('.layout-section:not(.hero-section)');
              const count = await sectionHeadings.count();

              for (let i = 0; i < count; i++) {
                const section = sectionHeadings.nth(i);
                // Bleed sections (like Marquee) intentionally break out to full width
                if ((await section.locator('.layout-bleed').count()) > 0) continue;

                const firstVisual = await section.evaluate((sec) => {
                  const candidates = sec.querySelectorAll(
                    '.project-card, .meta-sidebar, .about-portrait-wrapper, .section-header, .slash-label, h1, h2, .layout-grid > *:first-child, .layout-stack > *:first-child',
                  );
                  for (const cand of candidates) {
                    if (cand.closest('.cell-statement')) continue;
                    const rect = cand.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                      return { x: rect.x, y: rect.y, tag: cand.tagName, class: cand.className };
                    }
                  }
                  const firstChild = sec.firstElementChild;
                  if (firstChild) {
                    const r = firstChild.getBoundingClientRect();
                    return { x: r.x, y: r.y };
                  }
                  return null;
                });

                if (firstVisual) {
                  expect(
                    Math.abs(firstVisual.x - navLeft),
                    `Section index ${i} first element on ${route} does not align with Nav logo left edge (${firstVisual.x} vs ${navLeft})`,
                  ).toBeLessThanOrEqual(2.5);
                }
              }
            }
          }

          // 3. (b) No visible element with text extends outside padding boundaries (except Bleed items)
          const textBoundaryViolations = await page.evaluate((viewportWidth) => {
            const refSec = document.querySelector<HTMLElement>('.layout-section');
            const padValue = refSec ? parseFloat(getComputedStyle(refSec).paddingLeft) : 16;
            const minAllowedLeft = padValue - 2.5; // tolerance
            const maxAllowedRight = viewportWidth - (padValue - 2.5);

            const elements = Array.from(document.querySelectorAll('body *'));
            const offending = [];

            for (const el of elements) {
              const htmlEl = el;
              if (
                htmlEl.closest(
                  '.layout-bleed, .marquee, .hero-tags, #cur, #menu-overlay, .skip-link, .sr-only',
                )
              ) {
                continue;
              }
              const rect = htmlEl.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0 && htmlEl.childNodes.length > 0) {
                const hasDirectText = Array.from(htmlEl.childNodes).some(
                  (n) => n.nodeType === Node.TEXT_NODE && (n.nodeValue || '').trim().length > 0,
                );
                if (hasDirectText) {
                  if (rect.left < minAllowedLeft - 1 || rect.right > maxAllowedRight + 2) {
                    offending.push({
                      tag: htmlEl.tagName.toLowerCase(),
                      class: htmlEl.className,
                      left: rect.left,
                      right: rect.right,
                      minAllowedLeft,
                      maxAllowedRight,
                    });
                    if (offending.length >= 3) break;
                  }
                }
              }
            }
            return offending;
          }, vp.width);

          expect(
            textBoundaryViolations,
            `Text elements violating page padding on ${route}: ${JSON.stringify(textBoundaryViolations)}`,
          ).toHaveLength(0);
        });
      }

      // Route-specific geometric assertions for home page
      test('Home: Geometric layout invariants (sections padding, hero lead, statement, cards, capabilities)', async ({
        page,
      }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const metrics = await page.evaluate(() => {
          const refSec = document.querySelector<HTMLElement>(
            '.layout-section.section-size-default',
          );
          const refComp = refSec ? getComputedStyle(refSec) : null;
          const pad = refComp ? parseFloat(refComp.paddingLeft) : 16;
          const sectionY = refComp ? parseFloat(refComp.paddingTop) : 56;

          const nav = document.querySelector('.nav-header');
          const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;

          // Hero checks
          const heroLead = document.querySelector('.hero-lead');
          const heroLeadBox = heroLead ? heroLead.getBoundingClientRect() : null;

          // Section top padding checks (first heading top >= section top + section-y)
          const sections = Array.from(
            document.querySelectorAll<HTMLElement>('.layout-section.section-size-default'),
          );
          const sectionPaddings = sections.map((sec) => {
            const comp = getComputedStyle(sec);
            const padTop = parseFloat(comp.paddingTop);
            const padBottom = parseFloat(comp.paddingBottom);
            return { padTop, padBottom, id: sec.id || sec.getAttribute('aria-label') || 'unnamed' };
          });

          // Statement checks
          const statementContainer = document.querySelector<HTMLElement>('.statement-container');
          const statementBox = statementContainer
            ? statementContainer.getBoundingClientRect()
            : null;
          const gridEl = statementContainer?.closest('.layout-grid');
          const gridBox = gridEl ? gridEl.getBoundingClientRect() : null;

          // Cards and tiles padding checks
          const cards = Array.from(
            document.querySelectorAll<HTMLElement>('.project-card, .process-step, .stat-tile'),
          );
          const cardBoxes = cards.map((c) => {
            const r = c.getBoundingClientRect();
            return { left: r.left, right: r.right, className: c.className };
          });

          // Capability rows on load: must be closed by default
          const capRows = Array.from(
            document.querySelectorAll<HTMLDetailsElement>('details.capability-row'),
          );
          const allClosed = capRows.every((r) => !r.open && !r.classList.contains('is-expanded'));

          // Grid columns count for process and stats
          const processSteps = Array.from(
            document.querySelectorAll<HTMLElement>('.process-grid .process-step'),
          );
          const processXs = new Set(
            processSteps.map((s) => Math.round(s.getBoundingClientRect().x)),
          );

          const statTiles = Array.from(
            document.querySelectorAll<HTMLElement>('.stats-grid .stat-tile'),
          );
          const statsXs = new Set(statTiles.map((s) => Math.round(s.getBoundingClientRect().x)));

          return {
            pad,
            sectionY,
            navBottom,
            heroLeadBox: heroLeadBox ? { x: heroLeadBox.x, y: heroLeadBox.y } : null,
            sectionPaddings,
            statementBox: statementBox
              ? { width: statementBox.width, height: statementBox.height }
              : null,
            gridBox: gridBox ? { width: gridBox.width } : null,
            cardBoxes,
            allClosed,
            capabilityRowCount: capRows.length,
            processColCount: processXs.size,
            statsColCount: statsXs.size,
          };
        });

        // 1. Hero lead top >= nav bottom + minimum gap (>= 24px)
        if (metrics.heroLeadBox) {
          expect(
            metrics.heroLeadBox.y,
            `Hero lead (${metrics.heroLeadBox.y}px) should be below nav bottom (${metrics.navBottom}px) with a gap`,
          ).toBeGreaterThanOrEqual(metrics.navBottom + 24);
          expect(
            metrics.heroLeadBox.x,
            `Hero lead left edge (${metrics.heroLeadBox.x}px) should be at or inside page padding (${metrics.pad}px)`,
          ).toBeGreaterThanOrEqual(metrics.pad - 2);
        }

        // 2. Every section size=default has top and bottom padding equal to --layout-section-y
        for (const sp of metrics.sectionPaddings) {
          expect(
            Math.abs(sp.padTop - metrics.sectionY),
            `Section "${sp.id}" top padding (${sp.padTop}px) should equal --layout-section-y (${metrics.sectionY}px)`,
          ).toBeLessThanOrEqual(2);
          expect(
            Math.abs(sp.padBottom - metrics.sectionY),
            `Section "${sp.id}" bottom padding (${sp.padBottom}px) should equal --layout-section-y (${metrics.sectionY}px)`,
          ).toBeLessThanOrEqual(2);
        }

        // 3. Statement width >= 55% of grid on desktop, height < 600px (no one-word-per-line wrapping)
        if (metrics.statementBox && metrics.gridBox && vp.width >= 1101) {
          const ratio = metrics.statementBox.width / metrics.gridBox.width;
          expect(
            ratio,
            `Statement width ratio (${(ratio * 100).toFixed(1)}%) should span at least 55% of the grid`,
          ).toBeGreaterThanOrEqual(0.55);
          expect(
            metrics.statementBox.height,
            `Statement height (${metrics.statementBox.height}px) should be below 600px`,
          ).toBeLessThan(600);
        }

        // 4. Cards and tiles sit inside the page padding
        for (const cb of metrics.cardBoxes) {
          expect(
            cb.left,
            `Element with class "${cb.className}" left (${cb.left}px) should be inside page padding (${metrics.pad}px)`,
          ).toBeGreaterThanOrEqual(metrics.pad - 2);
          expect(
            cb.right,
            `Element with class "${cb.className}" right (${cb.right}px) should be inside viewport (${vp.width - metrics.pad}px)`,
          ).toBeLessThanOrEqual(vp.width - metrics.pad + 2);
        }

        // 5. Capability rows are closed by default on initial load
        expect(metrics.capabilityRowCount).toBeGreaterThan(0);
        expect(metrics.allClosed, 'All capability rows should be closed on initial load').toBe(
          true,
        );

        // 6. Process steps and stat tiles columns: 4 on desktop, 2 on mobile
        if (vp.width >= 1101) {
          expect(metrics.processColCount, 'Process grid should have 4 columns on desktop').toBe(4);
          expect(metrics.statsColCount, 'Stats grid should have 4 columns on desktop').toBe(4);
        } else if (vp.width <= 768) {
          expect(
            metrics.processColCount,
            'Process grid should have 2 columns on mobile/tablet',
          ).toBe(2);
          expect(metrics.statsColCount, 'Stats grid should have 2 columns on mobile/tablet').toBe(
            2,
          );
        }
      });
    });
  }
});
