import { test, expect } from '@playwright/test';

// Layout verification suite per docs/01-design/ollyo-layout-reference.md and layout-system.md.
// Enforces:
// 1. Single left edge alignment matching Container geometry across all sections and Nav logo.
// 2. Content edges follow verified ollyo formula:
//    - 992 to 1539px: 20px
//    - above 1539px: (V - 1539) / 2 + 20px
//    - 801 to 991px: (V - 800) / 2 + 20px
//    - 800px and below: 20px
// 3. Symmetrical right edge: content ends at or inside V - edge.
// 4. Hero distance from page top to first hero line: 200px (142px at <= 991px), bottom padding 120px.
// 5. Section size=default top & bottom padding = --layout-section-y.
// 6. 4 columns on desktop (> 991px), 2 columns on mobile/tablet (<= 768px).
// 7. Zero horizontal scroll at 375, 768, 1280, 1440, 1920px.

const viewports = [
  { width: 375, height: 667, name: 'mobile-small' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 800, name: 'desktop' },
  { width: 1440, height: 900, name: 'desktop-standard' },
  { width: 1920, height: 1080, name: 'desktop-wide' },
];

const testRoutes = ['/', '/work', '/work/project-one', '/about', '/contact', '/404'];

function getExpectedContentEdge(viewportWidth: number): number {
  if (viewportWidth > 1539) {
    return (viewportWidth - 1539) / 2 + 20;
  }
  if (viewportWidth >= 992) {
    return 20;
  }
  if (viewportWidth >= 801) {
    return (viewportWidth - 800) / 2 + 20;
  }
  return 20;
}

test.describe('Layout System Enforcement (docs/01-design/ollyo-layout-reference.md)', () => {
  for (const vp of viewports) {
    test.describe(`Viewport ${vp.width}px (${vp.name})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of testRoutes) {
        test(`${route}: no horizontal scroll and left edge aligns to Nav logo`, async ({
          page,
        }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('networkidle');

          const expectedEdge = getExpectedContentEdge(vp.width);

          // 1. (d) No horizontal scroll at any breakpoint
          const overflowInfo = await page.evaluate(() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollW = document.documentElement.scrollWidth;
            const culprits: Array<{
              tag: string;
              class: string;
              left: number;
              right: number;
              width: number;
            }> = [];
            document.querySelectorAll('*').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.right > docWidth + 1 || r.left < -1) {
                culprits.push({
                  tag: el.tagName,
                  class: el.className,
                  left: r.left,
                  right: r.right,
                  width: r.width,
                });
              }
            });
            return {
              hasScroll: scrollW > docWidth,
              docWidth,
              scrollW,
              culprits: culprits.slice(0, 5),
            };
          });

          if (overflowInfo.hasScroll) {
            console.log(`OVERFLOW on ${route} at ${vp.width}px:`, JSON.stringify(overflowInfo));
          }
          expect(overflowInfo.hasScroll, `Horizontal scroll detected on ${route}`).toBe(false);

          // Get Nav logo left edge (only on routes where Nav exists)
          if (route !== '/404') {
            const logo = page.locator('.nav-logo');
            const logoBox = await logo.boundingBox();
            if (logoBox) {
              const navLeft = logoBox.x;

              // Nav logo left edge should match expected ollyo content edge
              expect(
                Math.abs(navLeft - expectedEdge),
                `Nav logo left edge (${navLeft}px) should equal expected edge (${expectedEdge}px) on ${route}`,
              ).toBeLessThanOrEqual(2.5);

              // 2. (a) First heading or text in every layout-section starts at Nav logo's left edge (within 2.5px tolerance)
              const sectionHeadings = page.locator('.layout-section:not(.hero-section)');
              const count = await sectionHeadings.count();

              for (let i = 0; i < count; i++) {
                const section = sectionHeadings.nth(i);
                // Bleed sections (like Marquee) intentionally break out to full width
                if ((await section.locator('.layout-bleed').count()) > 0) continue;

                const firstVisual = await section.evaluate((sec) => {
                  const container = sec.querySelector<HTMLElement>('.layout-container');
                  const candidates = sec.querySelectorAll(
                    '.project-card, .meta-sidebar, .about-portrait-wrapper, .section-header, .slash-label, h1, h2',
                  );
                  for (const cand of candidates) {
                    if (cand.closest('.cell-statement')) continue;
                    const rect = cand.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                      return { x: rect.x, y: rect.y, tag: cand.tagName, class: cand.className };
                    }
                  }
                  if (container) {
                    const r = container.getBoundingClientRect();
                    const pad = parseFloat(getComputedStyle(container).paddingLeft);
                    return { x: r.x + pad, y: r.y };
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
          const textBoundaryViolations = await page.evaluate(
            ({ viewportWidth, expectedEdge }) => {
              const minAllowedLeft = expectedEdge - 2.5; // tolerance
              const maxAllowedRight = viewportWidth - (expectedEdge - 2.5);

              const elements = Array.from(document.querySelectorAll('body *'));
              const offending = [];

              for (const el of elements) {
                const htmlEl = el as HTMLElement;
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
            },
            { viewportWidth: vp.width, expectedEdge },
          );

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

        const expectedEdge = getExpectedContentEdge(vp.width);

        const metrics = await page.evaluate(() => {
          const probe = document.createElement('div');
          probe.style.height = 'var(--layout-section-y)';
          document.body.appendChild(probe);
          const sectionY = parseFloat(getComputedStyle(probe).height) || 56;
          probe.remove();

          const nav = document.querySelector('.nav-header');
          const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
          const navHeight = nav ? nav.getBoundingClientRect().height : 72;

          // Hero checks
          const heroSec = document.querySelector<HTMLElement>('.hero-section');
          const heroSecComp = heroSec ? getComputedStyle(heroSec) : null;
          const heroPadTop = heroSecComp ? parseFloat(heroSecComp.paddingTop) : 0;
          const heroPadBottom = heroSecComp ? parseFloat(heroSecComp.paddingBottom) : 0;

          const heroLead = document.querySelector('.hero-lead');
          const heroLeadBox = heroLead ? heroLead.getBoundingClientRect() : null;

          const heroDebug = {
            navHeight: nav ? nav.getBoundingClientRect().height : null,
            navBottom: nav ? nav.getBoundingClientRect().bottom : null,
            heroSecTop: heroSec ? heroSec.getBoundingClientRect().top : null,
            heroPadTop,
            heroLeadY: heroLeadBox ? heroLeadBox.y : null,
            heroLeadRowY: document.querySelector('.hero-lead-row')?.getBoundingClientRect().y,
            heroLeadRowMarginTop: document.querySelector('.hero-lead-row')
              ? getComputedStyle(document.querySelector('.hero-lead-row')!).marginTop
              : null,
          };
          console.log(`HERO DEBUG at ${window.innerWidth}px:`, JSON.stringify(heroDebug));

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
            sectionY,
            navBottom,
            navHeight,
            heroPadTop,
            heroPadBottom,
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

        // 1. Hero lead distance from page top:
        // Desktop (> 991px): 200px
        // Narrow (<= 991px): 142px
        const expectedHeroLeadY = vp.width > 991 ? 200 : 142;
        if (metrics.heroLeadBox) {
          expect(
            Math.abs(metrics.heroLeadBox.y - expectedHeroLeadY),
            `Hero lead top position (${metrics.heroLeadBox.y}px) should equal ${expectedHeroLeadY}px per ollyo reference`,
          ).toBeLessThanOrEqual(5.5);

          expect(
            Math.abs(metrics.heroLeadBox.x - expectedEdge),
            `Hero lead left edge (${metrics.heroLeadBox.x}px) should align with expected edge (${expectedEdge}px)`,
          ).toBeLessThanOrEqual(2.5);
        }

        // Hero bottom padding = 120px
        expect(
          Math.abs(metrics.heroPadBottom - 120),
          `Hero bottom padding (${metrics.heroPadBottom}px) should equal 120px`,
        ).toBeLessThanOrEqual(2);

        // 2. Every section size=default has top and bottom padding equal to --layout-section-y
        expect(
          metrics.sectionY,
          'Expected --layout-section-y to resolve to >= 56px',
        ).toBeGreaterThanOrEqual(56);
        for (const sp of metrics.sectionPaddings) {
          expect(
            sp.padTop,
            `Section "${sp.id}" top padding should be >= 56px`,
          ).toBeGreaterThanOrEqual(56);
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
        if (metrics.statementBox && metrics.gridBox && vp.width >= 992) {
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

        // 4. Cards and tiles sit inside the container edge
        for (const cb of metrics.cardBoxes) {
          expect(
            cb.left,
            `Element with class "${cb.className}" left (${cb.left}px) should be at or inside container left edge (${expectedEdge}px)`,
          ).toBeGreaterThanOrEqual(expectedEdge - 2);
          expect(
            cb.right,
            `Element with class "${cb.className}" right (${cb.right}px) should be inside container right edge (${vp.width - expectedEdge}px)`,
          ).toBeLessThanOrEqual(vp.width - expectedEdge + 2);
        }

        // 5. Capability rows are closed by default on initial load
        expect(metrics.capabilityRowCount).toBeGreaterThan(0);
        expect(metrics.allClosed, 'All capability rows should be closed on initial load').toBe(
          true,
        );

        // 6. Process steps and stat tiles columns: 4 on desktop (> 991px), 2 on mobile/tablet (<= 768px)
        if (vp.width >= 992) {
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
