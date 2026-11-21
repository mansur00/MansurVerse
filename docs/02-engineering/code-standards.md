# Code Standards

> Rules that keep the system maintainable by agents and humans, and how each rule is enforced. Last updated: 2026-11-19.

## 1. Language and Structure

- TypeScript `strict`; no `any` without a comment explaining why.
- One component per file; PascalCase component files, kebab-case other files (see `style-guide.md`).
- Components take typed props; `as` sets the element, `role` sets the text role, `variant` sets a named variant. No free-form `class` or `style` props that bypass tokens.
- Astro components by default; a framework island only when component state requires it.

## 2. Styling Rules and Enforcement

| Rule | Enforced by |
|---|---|
| No raw colours (hex, rgb, hsl) outside the token source | Stylelint `color-no-hex` plus a function allow-list; ESLint on inline styles |
| No `box-shadow`, `text-shadow`, `drop-shadow` anywhere | Stylelint disallowed-property and value lists; Tailwind shadow utilities removed from the theme |
| No `border` or `outline` outside the allowed exceptions (`spacing-radius-shadow.md`) | Stylelint with an allow-list of token-based declarations |
| No literal `font-family` or `font-size` | Stylelint; text roles only |
| No magic pixel values for spacing, radius or z-index | Stylelint unit and value rules with a token allow-list |
| Layout and spacing come only from tokens and layout primitives (`layout-system.md`) | Stylelint property rule, ESLint custom rule, `check-conventions.mjs` |
| No Tailwind arbitrary values | ESLint (Tailwind plugin) |
| No hardcoded visible copy, links or image paths in components | ESLint custom rule; review |
| Inline `style` only to pass a token reference, such as `--a: var(--color-accent-secondary-2)` | ESLint |

If a rule blocks a legitimate need, change the spec and decision log first, then the rule; never disable it inline.

## 3. JavaScript Rules

- All motion goes through the registry in `src/scripts/motion/`; no ad-hoc `requestAnimationFrame` loops or `setInterval` without cleanup.
- Every `init` has a `cleanup` that removes listeners, observers and tweens.
- Event listeners that scroll or pointer-move are passive and throttled by the ticker.
- Feature-detect (`CSS.supports`, `IntersectionObserver`, View Transitions); never user-agent sniff.
- Read layout in batches, then write; no layout reads inside animation loops.
- Import GSAP core and only the plugins used; load WebGL code with a dynamic import after first paint.
- Wrap `localStorage` and `navigator.clipboard` in try/catch with a defined fallback.

## 4. Accessibility Rules

- Semantic HTML first; ARIA only to fill gaps.
- Every interactive element is keyboard reachable with a visible focus state.
- Hover-only behaviour has focus and tap equivalents.
- Decorative elements are `aria-hidden`; informative images have real alt text.
- Animated text keeps its full text available to assistive technology.
- Lint: Astro and a11y ESLint rules; CI: axe-core.

## 5. Content and Schema Rules

- Content files are validated by Zod schemas; schemas live next to the content config.
- Accent fields are enums of token names; images are referenced through the image pipeline.
- Slugs are stable once published.

## 6. Comments and Docs

- Comments explain why, not what.
- Behaviour changes update the relevant doc in the same PR; decisions go in the decision log.
- A component is not done until it appears on `/styleguide`.

## 7. Testing Rules

| Area | Required tests |
|---|---|
| Token pipeline | Unit: schema, light and dark parity, contrast pairs, generated output snapshot |
| Content schemas | Unit: valid and invalid fixtures |
| Core flows | Playwright: nav, theme toggle, filter and view toggle, case-study navigation, contact form states |
| Preferences | Playwright with reduced motion and touch emulation |
| Accessibility | axe-core on every page in both themes |
| Visual | Playwright screenshots for key sections in both themes |

## 8. Review Checklist

Spec followed; tokens only; guardrails pass; both themes; fallbacks verified; a11y checks pass; no new dependency without a log entry; docs and decision log updated.
