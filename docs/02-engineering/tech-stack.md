# Tech Stack

> Every dependency and tool, with the reason and the version policy. Adding or replacing anything needs a decision-log entry (AGENTS.md rule 8). Versions below were checked on 2026-11-19; exact versions are pinned at install time. Last updated: 2026-11-19.

## 1. Stack

| Area | Choice | Version policy | Why | Status |
|---|---|---|---|---|
| Framework | Astro 7.x | 7.4.13 pinned | Content-driven site with islands: zero JS by default, JS only where interaction needs it. Astro 7 has a Rust compiler, Vite 8, and agent-friendly dev features (agent detection, background dev server, structured JSON logs) | Decided |
| Language | TypeScript, strict | 6.0.3 pinned | Typed props, content schemas and token constants (6.0.3 used as `@astrojs/check` does not yet support 7.0) | Decided |
| Styling | Tailwind CSS 4.x, theme generated from tokens | 4.3.5 pinned | CSS-first config maps cleanly onto the token pipeline; defaults are disabled so only tokens exist (see `tokens-implementation.md`) | Decided |
| Animation | GSAP 3.x with ScrollTrigger, Flip, SplitText, Draggable as needed | 3.15.1 pinned | GSAP and all its plugins are now free, including commercial use. Import only the plugins used | Decided |
| Smooth scroll | Lenis | 1.3.27 pinned | MIT licence; the chosen scroll engine (D-06). GSAP's ScrollSmoother is also free now, but Lenis stays unless it causes a conflict | Decided |
| WebGL | OGL by default | 1.0.11 pinned | Very small compared with Three.js, enough for a digit-field shader. Final choice stays open (O-04) | Open (default OGL) |
| Content | Astro content collections with Zod schemas | Built in | Build fails on invalid content, so agents cannot ship broken data | Decided |
| MDX | `@astrojs/mdx` | 8.1.6 pinned | Case-study bodies | Decided |
| Images | Astro image pipeline (sharp) | Built in | Responsive sizes, modern formats, explicit dimensions | Decided |
| Fonts | Self-hosted WOFF2 via Fontsource (`@fontsource/jersey-20`, `@fontsource-variable/stack-sans-notch`, `@fontsource-variable/plus-jakarta-sans`) | 5.3.0 pinned | No third-party requests; all OFL-1.1 | Decided (D-74) |
| Package manager | pnpm via corepack | 12.21.0 pinned in `packageManager` | Fast, strict, lockfile-first | Decided |
| Runtime | Node.js | 24.21.0 pinned in `.nvmrc`, `>=22.23.4` in `engines` | Minimum requirement for Astro 7 | Decided |
| Lint and format | ESLint (with Astro plugin), Prettier, Stylelint | eslint 10.15.0, prettier 3.10.1, stylelint 18.0.0 | Stylelint and ESLint carry the guardrails in `code-standards.md` | Decided |
| Unit tests | Vitest | 5.1.1 pinned | Token pipeline, schemas, utilities | Decided |
| E2E and visual | Playwright | | Page flows, route transitions, reduced-motion and touch emulation, screenshots | Assumed |
| Accessibility | axe-core (through Playwright) | | Automated a11y checks in CI | Assumed |
| Performance | Lighthouse CI | | Budget enforcement | Assumed |
| Forms | Provider undecided | | See `forms-and-integrations.md` (O-05) | Open |
| Hosting | Cloudflare or Vercel | | Output is static, so either works (O-03) | Open |

## 2. Rendering

Static output (`output: 'static'`). No server rendering and no adapter unless a form or API endpoint needs one; the preferred route for forms is an external provider or a single serverless function owned by the host.

## 3. Browser Support

Evergreen browsers, latest two versions of Chrome, Edge, Firefox and Safari (desktop and mobile). Newer features need fallbacks: View Transitions API (cross-fade), the individual `translate` property (transform fallback), `clip-path` shapes (flat blocks), `prefers-color-scheme`, `env(safe-area-inset-*)`.

## 4. Dependency Policy

1. Exact versions in `package.json`; lockfile committed.
2. Install only releases at least 14 days old (supply-chain safety); record exceptions in the decision log.
3. No dependency outside this table without a decision-log entry stating why the platform, Astro or GSAP cannot do it.
4. `pnpm audit` runs in CI; high-severity findings block release.
5. Updates are batched, one PR per group, with the full check suite green.
6. No runtime CDN scripts; everything is bundled.

## 5. Licences

| Item | Licence note |
|---|---|
| GSAP | Free standard licence, commercial use allowed (confirm the text at install and store it in the repo) |
| Lenis | MIT |
| Fonts | Stack Sans Notch is OFL; confirm Jersey 20 and Plus Jakarta Sans OFL before self-hosting (O-02) |
| Others | Checked at install; record in `docs/04-release/launch-checklist.md` |
