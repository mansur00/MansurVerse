# Phase 2: Tokens and Foundation Runbook

> Turns the design docs into code: token source, generated CSS and TypeScript, fonts, themes without flash, base styles, and an internal style-guide page. The token pipeline was run and tested in the authoring environment; the Astro, Tailwind and font parts could not be run there (no network), so Steps 3 to 7 are the real verification. Last updated: 2026-11-20.

## What Already Exists

| Path | Purpose |
|---|---|
| `src/styles/tokens/tokens.json` | Token source of truth (palette, semantic colours with light and dark, component tokens, text roles, spacing, radius, lines, shapes, z, opacity, blur, motion, easing, breakpoints, contrast pairs) |
| `scripts/tokens/lib.mjs` | Library: resolve references, generate files, contrast maths |
| `scripts/tokens-build.mjs` | Writes `src/styles/tokens/generated/` (`tokens.css`, `theme.css`, `text-roles.css`, `tokens.ts`, `tokens.summary.json`) |
| `scripts/tokens-check.mjs` | Validates references, light and dark parity, text-role rules, contrast pairs in both themes, unused primitives (warning), generated files current |
| `src/styles/global.css`, `fonts.css`, `base.css` | Entry stylesheet, Fontsource imports, base styles with focus ring and motion preferences |
| `src/scripts/theme-init.js`, `theme-toggle.ts` | Pre-paint theme script and the toggle logic |
| `src/layouts/BaseLayout.astro` | Minimal layout: global CSS, inlined theme script, title, noindex |
| `src/pages/styleguide.astro` | Internal style guide generated from `tokens.summary.json` |
| `scripts/strip-styleguide.mjs` | Removes `/styleguide` from production output unless `PUBLIC_ENABLE_STYLEGUIDE=true` |

## Already Verified (authoring environment)

- `tokens:build` and `tokens:check` run and pass.
- The check catches real problems: it proved the prototype's muted grey `#6b6b6b` gives only 4.27:1 on the alt band (now `#636363`, 4.81:1), and that dark-theme muted text on a white card gives only 2.81:1 (hence the `text-muted-on-card` token).
- A deliberately broken token makes `tokens:check` fail; restoring it passes.
- `strip-styleguide.mjs` removes the page by default and keeps it when asked.

## Steps

1. **Install fonts.** `pnpm add @fontsource/jersey-20 @fontsource-variable/stack-sans-notch @fontsource-variable/plus-jakarta-sans` (exact versions come from `.npmrc`). If a package name or CSS entry differs, adjust `src/styles/fonts.css` and the family names in `tokens.json` (`font` group); variable families are normally named with a "Variable" suffix.
2. **Build and check tokens.** `pnpm run tokens:build && pnpm run tokens:check` must pass.
3. **Open the style guide.** `pnpm run dev`, then `/styleguide`. Check: all three fonts render in the right roles; every text role shows; swatches match `color-tokens.md` in both themes.
4. **Check themes.** Toggle the theme; reload and confirm there is no flash; set the OS to dark with no stored choice and confirm the page follows it; tab to the button and confirm the focus ring shows.
5. **Check Tailwind.** Confirm the `@theme` import works (a utility such as `bg-bg-base` should generate CSS). Confirm default utilities are gone: temporarily add `shadow-lg` and `bg-red-500` to a test element; neither may generate CSS. If the imported `@theme` has no effect, have `tokens-build` write the theme block into `global.css` instead, and log it.
6. **Compare with ollyo (O-01).** In DevTools on ollyo.com, copy computed font-family, size, line-height and letter-spacing for the hero `h1`, a section heading, a project card title, a keyword tag and body text. Compare with the text roles; adjust `tokens.json`, rebuild, update `typography.md`.
7. **Run everything.** `pnpm run format` once, then `pnpm run verify`. Fix issues (Stylelint on `.astro` files and `astro check` on the new `.ts` and `.astro` files are the likeliest).
8. **Check the production build.** `pnpm run build` with `PUBLIC_ENABLE_STYLEGUIDE` unset must leave no `dist/styleguide`.
9. **Update the docs and commit.** Record verified versions and any fixes; mark Phase 2 in `development-roadmap.md`.

## Not Yet Done on Purpose

Font preloading and metric-adjusted fallback faces (Phase 4 and Phase 7, because they need the real layout to measure). The view-transition theme reveal (I-01) and the motion toggle (I-37) arrive in Phase 5. Real components arrive in Phase 3.

## Exit Checklist

- [ ] `pnpm run verify` passes on a fresh clone
- [ ] `/styleguide` shows every token and role correctly in both themes
- [ ] No theme flash; system preference respected; choice persists
- [ ] Tailwind exposes only tokens (no default colours, no shadow utilities)
- [ ] Production build contains no `/styleguide`
- [ ] Type roles compared with ollyo and adjusted (O-01), docs updated
- [ ] Owner approves the phase
