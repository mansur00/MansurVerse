# Tokens Implementation

> How the design tokens in `design-system.md`, `color-tokens.md`, `typography.md`, `spacing-radius-shadow.md` and `interaction-motion.md` become code. Last updated: 2026-11-19.

## 1. Source of Truth

One file: `src/styles/tokens/tokens.json`. It has three layers (primitive, semantic, component) and these groups: `palette`, `color`, `font`, `text`, `space`, `radius`, `line`, `shape`, `z`, `layout`, `motion`, `opacity`. Semantic tokens define `light` and `dark` values that reference primitives by name. Component tokens reference semantic tokens.

Generated output is never edited by hand and is committed so diffs are reviewable.

## 2. Build Outputs (`tokens:build`)

| Output | Content |
|---|---|
| `generated/tokens.css` | CSS variables: primitives and semantics on `:root`; dark values under `:root[data-theme="dark"]` and under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`; `color-scheme` per theme |
| `generated/theme.css` | Tailwind 4 `@theme` block mapping tokens to utilities |
| `generated/tokens.ts` | Typed constants for JS (motion durations, easings, breakpoints) so GSAP code never uses literals |
| `generated/text-roles.css` | One class per text role (`.text-display-hero`, `.text-heading-section`, ...) with font, size, line height, tracking and weight |
| `generated/tokens.json` summary | Data for the `/styleguide` page |

## 3. Tailwind Configuration

- Reset defaults in the theme so only tokens exist: set the default colour, font, spacing, radius and shadow namespaces to `initial`, then define ours. This removes shadow utilities entirely, which enforces the flat look.
- Utilities map to semantic and component tokens; primitives are not exposed as utilities.
- No arbitrary values (lint rule in `code-standards.md`).

## 4. Theme Switching

- State lives on `<html data-theme="light|dark">`.
- A blocking inline script in `<head>` runs before first paint: reads `localStorage` (in try/catch), falls back to the system preference, sets the attribute. This prevents a flash.
- The toggle writes the attribute and storage; where supported it uses the View Transitions API for the circle reveal (I-01).
- `color-scheme` is set per theme so native controls match.

## 5. Fonts

- Families and roles: `typography.md`.
- Self-hosted WOFF2, Latin subset, `font-display: swap`, variable axes for Stack Sans Notch and Plus Jakarta Sans, a single weight for Jersey 20, `font-synthesis: none`.
- Fallback faces use `size-adjust` and metric overrides to minimise layout shift.
- Preload Jersey 20 and Plus Jakarta Sans (above the fold).
- Mechanism: Astro's fonts configuration or Fontsource packages; pick one at Phase 2 and record it (O-17). Licence texts are stored in the repo.

## 6. Shapes, Motion and Content Accents

- Shape tokens are CSS variables holding `clip-path` values (`--shape-pixel-blob`, `--shape-pixel-corner`) and the half-pill radius.
- Motion tokens exist both as CSS variables (for CSS transitions) and as TS constants (for GSAP).
- A project's `accent` content field is an enum of accent token names; the component sets `--a: var(--color-accent-secondary-N)` from it. Content never contains colour values.

## 7. Validation (`tokens:check`)

Fails the build when: a semantic token lacks a light or dark value; a reference points to a missing token; names are duplicated; a declared text-on-background pair misses its contrast threshold (4.5:1 body, 3:1 large); a token is unused (reported as a warning, then removed in the next cleanup); generated files are out of date (`tokens:build` then `git diff --exit-code` in CI).

## 8. Migration From the Prototype

| Prototype value | Becomes |
|---|---|
| `--lime` and friends | `--palette-*`, then `--color-accent-*` |
| `--bg`, `--bg2`, `--surf`, `--dark`, `--ink`, `--mute`, `--line` | `--color-bg-base`, `-alt`, `-surface`, `-feature`, `--color-text-primary`, `-muted`, `--color-divider` |
| `--font-display`, `--font-label`, `--font-body` | Same names under `font` |
| Inline `clamp()` sizes | Text role tokens |
| Hardcoded timings (`.8s`, `3.6s`, `30s`) | `--motion-*` |
| `clip-path` polygons | `--shape-*` |

Palette values use the verified ollyo values in `color-tokens.md`, not the prototype's approximations.

## 9. Done When

`tokens:build` and `tokens:check` pass; the `/styleguide` page renders every token in both themes; no component references a primitive or a raw value; generated files are committed and current.

## 10. Phase 2 Implementation Notes

- **Files:** `scripts/tokens/lib.mjs`, `scripts/tokens-build.mjs`, `scripts/tokens-check.mjs`. Outputs in `src/styles/tokens/generated/`: `tokens.css`, `theme.css`, `text-roles.css`, `tokens.ts` and `tokens.summary.json` (the data for `/styleguide`).
- **Pipeline is dependency-free Node.** It was run and tested, including a negative test where a failing contrast value makes `tokens:check` fail.
- **Tailwind theme:** defaults are reset for colour, font, text size, font weight, radius, shadow (all shadow namespaces), blur, easing, animation and breakpoints. `--spacing` is 4px, matching the space scale (allowed multiples 1, 2, 3, 4, 6, 8, 12, 16, 24, 32). Breakpoint names are `tablet` (721px) and `desktop` (1101px). The blur token `--blur-digit-field` is the only blur.
- **Theme state:** `src/scripts/theme-init.js` is inlined by `BaseLayout.astro` and sets `data-theme` and `data-motion` from storage before paint; with no stored choice the CSS media query follows the system.
- **Fonts:** Fontsource packages (D-65). Variable families are referenced as `'Stack Sans Notch Variable'` and `'Plus Jakarta Sans Variable'`; Jersey 20 is static (400). Preloads and metric-adjusted fallbacks come in Phase 4 and Phase 7.
- **Style guide:** `/styleguide` is generated from `tokens.summary.json`; `scripts/strip-styleguide.mjs` removes it from production output unless `PUBLIC_ENABLE_STYLEGUIDE=true`.
- **Not yet run in this environment:** the Tailwind `@theme` import chain, `astro check`, and Stylelint on `.astro` files; see the Phase 2 runbook.
