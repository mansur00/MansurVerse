import { test, expect } from '@playwright/test';

// Layout verification test suite per docs/01-design/layout-system.md section 8.
// Runs across 4 target viewports: 375px (mobile), 768px (tablet), 1280px (desktop), 1920px (ultrawide).

const VIEWPORTS = [
  { width: 375, height: 812, name: '375px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1280, height: 900, name: '1280px' },
  { width: 1920, height: 1080, name: '1920px' },
];

const PAGES = ['/', '/work', '/about', '/contact', '/404'];

for (const vp of VIEWPORTS) {
  test.describe(`Layout system at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const pagePath of PAGES) {
      test(`verifies layout contracts on ${pagePath}`, async ({ page }) => {
        await page.goto(pagePath);
        await page.waitForLoadState('domcontentloaded');

        // (d) No horizontal scroll: scrollWidth === clientWidth
        const scrollInfo = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          return {
            scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
            clientWidth: doc.clientWidth,
          };
        });

        if (scrollInfo.scrollWidth > scrollInfo.clientWidth) {
          const offending = await page.evaluate((clientW) => {
            const elements = document.querySelectorAll('body *');
            const bad = [];
            for (const el of elements) {
              const r = el.getBoundingClientRect();
              if (r.right > clientW) {
                bad.push({
                  selector:
                    el.tagName.toLowerCase() +
                    (el.id ? `#${el.id}` : '') +
                    (el.className ? `.${String(el.className).trim().split(/\s+/).join('.')}` : ''),
                  right: r.right,
                  clientWidth: clientW,
                });
              }
            }
            return bad.slice(0, 5);
          }, scrollInfo.clientWidth);

          expect(
            scrollInfo.scrollWidth,
            `Horizontal scroll detected on ${pagePath} at ${vp.name}!\nOffending elements: ${JSON.stringify(offending, null, 2)}`,
          ).toBeLessThanOrEqual(scrollInfo.clientWidth);
        }

        // Locate nav logo for left-edge comparison
        const navLogo = page.locator('.nav-logo').first();
        if (await navLogo.isVisible()) {
          const logoBox = await navLogo.boundingBox();
          expect(logoBox).not.toBeNull();
          const expectedLeft = logoBox!.x;

          // (a) First heading or text of every section starts at the Nav logo's left edge within 1px
          // For multi-column sections (Grid/Stack), the container and column 1 align to the left edge.
          const sectionEvaluations = await page.evaluate(
            ({ leftEdge }) => {
              const sections = Array.from(document.querySelectorAll('.layout-section'));
              return sections.map((sec) => {
                const id = sec.id || sec.getAttribute('aria-label') || 'unnamed-section';
                // Find primary layout element or heading
                const target = sec.querySelector(
                  '.layout-grid, .layout-stack, h1, h2, h3, .slash-label',
                );
                if (!target) return { id, valid: true };
                const r = target.getBoundingClientRect();
                const diff = Math.abs(r.x - leftEdge);
                return {
                  id,
                  diff,
                  valid: diff <= 1.5, // 1.5px tolerance for subpixel rounding
                  actualX: r.x,
                  expectedX: leftEdge,
                };
              });
            },
            { leftEdge: expectedLeft },
          );

          for (const ev of sectionEvaluations) {
            expect(
              ev.valid,
              `Section '${ev.id}' layout starts at ${ev.actualX}px, expected ${ev.expectedX}px (diff: ${ev.diff}px)`,
            ).toBe(true);
          }

          // (b) No visible element extends past viewport width minus the right padding (except Bleed items)
          const rightLimit = vp.width - expectedLeft;
          const overflowReport = await page.evaluate(
            ({ limit }) => {
              const bleedContainers = Array.from(
                document.querySelectorAll('.layout-bleed, .layout-bleed *'),
              );
              const isBleed = (el: Element) => bleedContainers.includes(el);
              const isClippedByParent = (el: Element) => {
                let parent = el.parentElement;
                while (parent && parent !== document.body) {
                  const style = getComputedStyle(parent);
                  if (style.overflow === 'hidden' || style.overflowX === 'hidden') return true;
                  parent = parent.parentElement;
                }
                return false;
              };

              const offenders: string[] = [];
              for (const el of document.querySelectorAll('.layout-section *')) {
                if (isBleed(el) || isClippedByParent(el)) continue;
                const r = el.getBoundingClientRect();
                // Only consider rendered, visible elements with positive dimension
                if (r.width > 0 && r.height > 0 && r.right > limit + 2) {
                  if (el.classList.contains('layout-grid') || el.classList.contains('layout-stack'))
                    continue;
                  offenders.push(
                    `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : ''} (right: ${r.right}px > limit: ${limit}px)`,
                  );
                }
              }
              return offenders.slice(0, 5);
            },
            { limit: rightLimit },
          );

          expect(
            overflowReport.length,
            `Elements overflowing right page padding on ${pagePath} at ${vp.name}:\n${overflowReport.join('\n')}`,
          ).toBe(0);
        }

        // (c) Each section's computed top padding equals its size token value
        const paddingCheck = await page.evaluate(() => {
          const probe = document.createElement('div');
          probe.style.paddingTop = 'var(--layout-section-y)';
          probe.style.paddingBottom = 'var(--layout-section-y-compact)';
          probe.style.position = 'absolute';
          probe.style.visibility = 'hidden';
          document.body.appendChild(probe);

          const defaultVal = parseFloat(getComputedStyle(probe).paddingTop);
          const compactVal = parseFloat(getComputedStyle(probe).paddingBottom);
          probe.remove();

          const sections = Array.from(document.querySelectorAll('.layout-section'));
          return sections.map((sec) => {
            const id = sec.id || sec.getAttribute('aria-label') || 'unnamed-section';
            const comp = getComputedStyle(sec);
            const topPad = parseFloat(comp.paddingTop);

            if (sec.classList.contains('section-size-default')) {
              const diff = Math.abs(topPad - defaultVal);
              return { id, valid: diff <= 1.5, actual: topPad, expected: defaultVal };
            }
            if (sec.classList.contains('section-size-compact')) {
              const diff = Math.abs(topPad - compactVal);
              return { id, valid: diff <= 1.5, actual: topPad, expected: compactVal };
            }
            if (sec.classList.contains('section-size-none')) {
              return { id, valid: true, actual: topPad, expected: 0 };
            }
            return { id, valid: true, actual: topPad, expected: defaultVal };
          });
        });

        for (const res of paddingCheck) {
          expect(
            res.valid,
            `Section '${res.id}' paddingTop is ${res.actual}px, expected token value ${res.expected}px`,
          ).toBe(true);
        }
      });
    }
  });
}
