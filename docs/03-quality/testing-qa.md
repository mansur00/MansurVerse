# Testing and QA

> What is tested, how, when, and what blocks a release. Tools are in `tech-stack.md`; rules in `code-standards.md`. Last updated: 2026-11-19.

## 1. Strategy

Automated checks catch regressions in tokens, content, flows, accessibility and performance on every PR. Manual QA covers what automation cannot judge: feel, polish and real devices.

## 2. Matrices

| Dimension | Values |
|---|---|
| Viewport widths | 320, 375, 414, 768, 1024, 1280, 1440, 1920 |
| Browsers | Latest two of Chrome, Edge, Firefox, Safari; iOS Safari and Android Chrome on real devices |
| Themes | Light, dark (toggle and system preference) |
| Preferences | Default, reduced motion, motion toggle off, coarse pointer, no JavaScript, `saveData` |
| WebGL | Available, blocked or failed |

## 3. Automated Suite

| Layer | Content | Runs |
|---|---|---|
| Unit (Vitest) | Token schema, light and dark parity, contrast pairs, content schemas, form validators, motion helpers, registry lifecycle | Every PR |
| E2E (Playwright) | Every route, nav, theme toggle and persistence, filter and view toggle, card to case study and back, focus after navigation, contact form states with a mocked endpoint, 404 | Every PR |
| Preference runs | The E2E suite repeated with reduced motion, touch emulation and JavaScript disabled | Every PR |
| Accessibility (axe) | Every page in both themes | Every PR |
| Visual | Screenshots of key sections in both themes with motion reduced and the digit field static | Every PR; changes reviewed by the owner |
| Performance | Lighthouse CI and build-size check | Every PR |
| Dependencies | `pnpm audit` | Every PR and weekly |

## 4. Manual QA

- Walk every page and every interaction in `interaction-motion.md` on desktop and on a real phone, with its fallbacks.
- Keyboard-only and screen-reader passes (`accessibility.md`).
- Slow-network and low-power pass (CPU throttling, 4G profile).
- Content pass: zero `placeholder` flags, no broken links, correct alt text, typography and punctuation.
- Cross-browser visual comparison against the approved design.

## 5. Bug Severity

| Level | Meaning | Rule |
|---|---|---|
| S1 | Site broken, data loss, form cannot send, page inaccessible | Blocks release; fix immediately |
| S2 | Feature broken or fails accessibility, budget exceeded | Blocks release |
| S3 | Visual or interaction defect with a workaround | Fix before launch where feasible |
| S4 | Cosmetic polish | Backlog |

## 6. CI Pipeline and Gates

1. Install with the lockfile, tokens build and check, type check, lint, Stylelint.
2. Unit tests.
3. Production build.
4. E2E, preference runs, axe, visual, Lighthouse and size checks against the preview build.
5. Audit.

Merge requires every stage green. Visual diffs need owner approval.

## 7. Fixtures and Data

Content fixtures cover: empty and full lists, long titles, missing optional fields, invalid examples for schema tests. The form endpoint is mocked in tests; the real endpoint is tested manually once before launch.

## 8. Phase Exit Checks

Each phase in `development-roadmap.md` ends with the full suite green plus the manual items relevant to that phase, signed off by the owner.
