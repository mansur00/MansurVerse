# Decision Log

> Every decision, assumption and open item. Status: **Decided** (owner stated or approved), **Assumed** (agent default, owner may change), **Open** (needs a decision). Changes are appended, never silently rewritten. Last updated: 2026-11-18.

## Decisions

| ID | Decision | Status | Notes |
|---|---|---|---|
| D-01 | Portfolio is UI-design focused: modern, fancy, highly interactive | Decided | Owner |
| D-02 | Reference is ollyo.com for layout style, typography roles and flat look; not generic | Decided | Copy style, not copy or assets |
| D-03 | Pages: Home, Work, Case study template, About, Contact, 404. Lab and Notes are out of scope | Decided | Owner picked core scope |
| D-04 | Theme: dark and light with a toggle | Decided | Follows system preference first |
| D-05 | Site language: English only | Decided | Text still lives in content files |
| D-06 | Stack: Astro, TypeScript, Tailwind 4, GSAP, Lenis, WebGL | Decided | Chosen for a content-driven site with rich interaction; owner agreed |
| D-07 | Content lives in the repo as MDX/JSON, validated by schemas | Decided | Owner |
| D-08 | Several agents will be used; `AGENTS.md` is the single entry point | Decided | Owner |
| D-09 | No hardcoding of design or content values; the agent maintains the system strictly per the docs | Decided | Owner |
| D-10 | Flat look: no shadows, no strokes on filled elements; outlined elements have no fill; hairline divider token is the only line | Decided | Owner rule, consistent with ollyo screenshots |
| D-11 | Fonts: Jersey 20 for `h1` only; Stack Sans Notch for `h2` to `h6`, labels, stat numbers; Plus Jakarta Sans for body | Decided | Owner |
| D-12 | Type is large; headings use the unique font at big sizes as on ollyo | Decided | Owner |
| D-13 | Hero background: minimal field of small, slightly blurred `0`/`1` digits, cursor-reactive | Decided | Replaces dots; canvas fallback |
| D-14 | Hero highlights three keywords (Code, Motion, Design) as animated, gently floating tags | Decided | Owner |
| D-15 | Home work section is vertical: four full-width project cards stacked | Decided | Owner |
| D-16 | Project cards: white background, decorative pixelated shapes, project image on top | Decided | Owner, from ollyo Tutor LMS reference |
| D-17 | Home includes Values and Numbers sections; Numbers has no blue gradient | Decided | Owner |
| D-18 | Inner pages receive extra sections reused from Home | Decided | Owner |
| D-19 | Interactions are tiered (signature and supporting) with reduced-motion, touch and no-WebGL fallbacks | Decided | Agent proposal, owner accepted |
| D-20 | Spec files are written in batches, phase by phase, each approved by the owner | Decided | Owner |
| D-21 | The prototype is a visual and interaction reference only, not production code | Decided | Uses canvas, no GSAP or Lenis, placeholder images |
| D-22 | Working palette: lime `#9dfa5f`, blue `#2f5bff`, pink `#ff6ad5`, cyan `#22e3f0`, ink `#0d0d0d`, light `#f2f2f2` / `#e6e6e6`, charcoal `#3d3d3d` | Superseded | Replaced by verified values in D-30 |
| D-23 | Audience is employers and clients | Assumed | |
| D-24 | Batch 1 spec files approved | Decided | Owner, 2026-11-18 |
| D-25 | Muted text tokens are darker than the prototype (`#6b6b6b` light, `#9a9a9a` dark) to meet 4.5:1 contrast | Superseded | `#6b6b6b` measured 4.27:1 on the alt band; see D-66 |
| D-26 | Hero `h1` and page `h1` use Jersey 20 regardless of visual size; `h2` to `h6` always use Stack Sans Notch; components take separate `as` and `role` props | Assumed | Follows the owner's font rule |
| D-27 | Allowed lines: hairline divider, outlined chip/button, focus ring, compare-slider handle; no other strokes | Assumed | Derived from the owner's stroke rule |
| D-28 | ollyo's root CSS variables (colours and font families) are the verified source for tokens | Decided | Owner supplied the CSS on 2026-11-18 |
| D-29 | Logo wordmark is "MansurVerse": "Mansur" in Jersey 20, "Verse" in Stack Sans Notch | Decided | Owner |
| D-30 | Palette uses ollyo's exact values: lime `#9FFA62`, charcoal `#3D3D3D`, light `#F1F1F1`, ink `#000000`, plus lime-deep, lime-yellow, sky, coral, forest | Decided | See `color-tokens.md` |
| D-31 | Dark theme is our own design; ollyo has none | Assumed | |
| D-32 | No CSS `scroll-behavior: smooth`; Lenis handles smooth scrolling | Assumed | The two conflict |
| D-33 | Batch 2 design foundation docs approved | Decided | Owner, 2026-11-18 |
| D-34 | Interaction catalogue I-01 to I-36 with tiers and a fallback matrix is the interaction spec | Assumed | See `interaction-motion.md` |
| D-35 | Motion tokens (durations, easings, stagger) taken from the prototype | Assumed | |
| D-36 | Only transform, opacity, clip-path and colour are animated (accordion grid-rows excepted) | Assumed | Performance rule |
| D-37 | Reused blocks are single components parameterised by content, never copied markup | Decided | Owner wanted a non-hardcoded system |
| D-38 | Internal `/styleguide` page, noindex, not in production | Assumed | See `style-guide.md` |
| D-39 | Batch 3 design docs approved | Decided | Owner, 2026-11-19 |
| D-40 | GSAP and all its plugins are free including commercial use; earlier note that ScrollSmoother was paid is outdated. Lenis stays the scroll engine | Decided | Verified 2026-11-19 |
| D-41 | Astro 7.x (7.4 released 2026-10-15) is the framework version line | Decided | Verified 2026-11-19 |
| D-42 | Static output, no adapter unless a form endpoint needs one | Assumed | |
| D-43 | pnpm; exact version pins; only releases at least 14 days old | Assumed | Supply-chain safety |
| D-44 | Tooling: ESLint, Prettier, Stylelint, Vitest, Playwright, axe-core, Lighthouse CI | Assumed | |
| D-45 | Tailwind theme defaults are reset so only tokens exist; shadow utilities are removed | Assumed | Enforces the flat look |
| D-46 | OGL is the default WebGL library | Assumed | O-04 remains open |
| D-47 | Batch 4 engineering docs approved | Decided | Owner, 2026-11-19 |
| D-48 | Route transitions use Astro `<ClientRouter />` with `transition:name` and `transition:persist`; page scripts init on `astro:page-load` | Assumed | Closes O-18; verified against Astro's docs |
| D-49 | Wordmark parts live in site config (`brand.primary`, `brand.secondary`) | Assumed | No hardcoded logo text |
| D-50 | Content entries may carry `placeholder: true`; production builds warn and launch requires zero | Assumed | |
| D-51 | Project bodies are MDX with fixed headings (Overview, Problem, Solution, Results) checked at build | Assumed | Sidebar and scroll-spy derive from headings |
| D-52 | Contact form goes through one `submitContact` module; honeypot plus time check baseline; provider chosen in Phase 5 | Assumed | O-05 stays open |
| D-53 | Analytics default is none | Assumed | O-06 stays open |
| D-54 | Batch 5 docs approved | Decided | Owner, 2026-11-19 |
| D-55 | Footer motion toggle (I-37) pauses all non-essential motion, persists, and starts from the OS preference | Assumed | Required by WCAG 2.2.2 for auto-playing motion over 5 seconds |
| D-56 | Target is WCAG 2.2 AA; our touch target rule is 44px | Assumed | |
| D-57 | Performance and Lighthouse numbers in `performance-budget.md` are starting budgets, tuned in Phase 7 | Assumed | Home mobile may score 85 |
| D-58 | Default hosting recommendation: Cloudflare Workers static assets; owner decides (O-03) | Assumed | Verified 2026-11-19 against Astro and community docs; re-verify at setup |
| D-59 | Security headers and a CSP with a hash for the inline theme script | Assumed | |
| D-60 | Batch 6 docs approved; Phase 0 complete | Decided | Owner, 2026-11-19 |
| D-61 | The repository root is the folder containing `docs/` and `AGENTS.md`; the approved prototype lives in `reference/` | Assumed | |
| D-62 | `minimum-release-age=20160` in `.npmrc` enforces the 14-day rule | Assumed | Verify the installed pnpm supports it |
| D-63 | Guardrail exceptions (strokes) are file-scoped through Stylelint overrides, listed in `stylelint.config.mjs` | Assumed | Matches `spacing-radius-shadow.md` section 4 |
| D-64 | `scripts/test-guardrails.mjs` with bad and good fixtures proves the Stylelint guardrails inside `verify` | Assumed | |
| D-65 | Fonts are self-hosted through Fontsource packages (`@fontsource/jersey-20`, `@fontsource-variable/stack-sans-notch`, `@fontsource-variable/plus-jakarta-sans`); variable families carry a "Variable" suffix | Assumed | Verify package names at install |
| D-66 | Light muted text is `#636363` (the prototype's `#6b6b6b` measured 4.27:1 on the alt band) | Decided | Measured by `tokens:check` |
| D-67 | `text-muted-on-card` is a fixed `#636363` because the card stays white in the dark theme, where `#9a9a9a` reaches only 2.81:1 | Decided | Measured |
| D-68 | Tailwind `--spacing` is 4px to match the space scale | Assumed | |
| D-69 | `dev` and `build` run `tokens:build` first; `/styleguide` is stripped from production builds unless `PUBLIC_ENABLE_STYLEGUIDE=true` | Assumed | |
| D-70 | The token pipeline is dependency-free Node and was tested, including a negative contrast test | Decided | |
| D-71 | Node pinned to 24.21.0 in `.nvmrc`, engines.node set to `>=22.23.4` in `package.json` for Astro 7 | Decided | Verified at setup |
| D-72 | TypeScript pinned to 6.0.3 because `@astrojs/check` does not yet support TypeScript 7.0 | Decided | Verified at setup |
| D-73 | Optional catch binding used in `src/scripts/theme-init.js` to satisfy ESLint `@typescript-eslint/no-unused-vars` | Decided | Verified at setup |
| D-74 | Font licences (Jersey 20, Stack Sans Notch, Plus Jakarta Sans) confirmed OFL-1.1; installed via Fontsource | Decided | Closes O-02 |
| D-75 | Pinned pnpm 12.21.0 via corepack; verify and guardrails pass | Decided | Verified at setup |

## Open Items

| ID | Item | Needed by | Notes |
|---|---|---|---|
| O-01 | Verify remaining ollyo tokens: type scale, per-element fonts, spacing, radii, borders, pink/cyan/blue colours | Phase 2 | Colours and font families verified (D-28). Owner can copy computed styles of the hero h1, a section heading, a project card and a keyword tag from DevTools |
| O-02 | Confirm font licences and self-hosting plan for all three fonts | Closed | Resolved by D-74 (OFL-1.1 via Fontsource) |
| O-03 | Hosting: Cloudflare or Vercel | Phase 8 | Compare in `deployment.md` |
| O-04 | WebGL library: Three.js, OGL or a custom shader | Phase 6 | Digit field is simple; prefer the lightest option |
| O-05 | Contact form provider and spam protection | Phase 5 | |
| O-06 | Analytics: none or a privacy-friendly option | Phase 8 | |
| O-07 | Skill chips with physics (draggable) | Phase 5 | Optional |
| O-08 | Preloader | Phase 5 | Optional |
| O-09 | Numbers section backdrop: dotted gradient or photo | Phase 4 | Decide when real images exist |
| O-10 | Real content and images (name, bio, portrait, projects, CV, socials, email) | Phase 4 | Owner supplies; placeholders until then |
| O-11 | Domain name | Phase 8 | |
| O-12 | Logo font question | Closed | Resolved by D-29 |
| O-13 | ollyo declares Jersey 25 and Inter as font variables; confirm whether either should be used | Closed | Resolved: three fonts only (Jersey 20, Stack Sans Notch, Plus Jakarta Sans) |
| O-14 | Process section: simple sequential reveal or pinned stage with a drawn path (needs a stroke exception) | Phase 5 | Default: simple reveal |
| O-15 | Capabilities layout: accordion rows (prototype) or flowing inline list from the ollyo reference | Phase 3 | Default: accordion rows |
| O-16 | Whose time zone does the footer clock show: owner's (site config) or visitor's | Phase 4 | Default: owner's |
| O-17 | Font self-hosting mechanism and Tailwind minor version | Closed | Fontsource chosen (D-65); the Tailwind minor is pinned at install |
| O-18 | Route transition mechanism | Closed | Resolved by D-48 |
