# Development Environment

> Setup, commands, environment variables, git workflow and agent setup. Commands below are the planned interface; they are created in Phase 1 and this file is updated to match. Last updated: 2026-11-19.

## 1. Prerequisites

- Node.js 24.21.0 (pinned in `.nvmrc`, `engines.node` `>=22.23.4`)
- pnpm 12.21.0 via corepack (pinned in `packageManager`)
- Git 2.50+; modern evergreen browsers

## 2. Planned Scripts

| Script | Purpose |
|---|---|
| `dev` | Astro dev server (agents may run it in the background with JSON logs) |
| `build` | Token build, then Astro production build |
| `preview` | Serve the production build locally |
| `check` | `astro check` plus TypeScript |
| `lint` | ESLint |
| `lint:css` | Stylelint (flat-look and token guardrails) |
| `format` | Prettier write; `format:check` in CI |
| `tokens:build` | Generate CSS, Tailwind theme and TS constants from the token source |
| `tokens:check` | Validate tokens: schema, light and dark parity, contrast pairs, unused tokens |
| `test` | Vitest |
| `test:e2e` | Playwright flows (desktop, mobile, reduced motion, touch) |
| `test:a11y` | axe-core checks |
| `lighthouse` | Lighthouse CI against the budget |
| `verify` | Everything required for done: tokens, check, lint, lint:css, test, build |

## 3. Environment Variables

- Names are listed in `.env.example`; real values never committed.
- Client-exposed variables use the `PUBLIC_` prefix and must contain nothing secret.
- Planned: `PUBLIC_SITE_URL`, form provider endpoint or key (O-05), analytics id if any (O-06).

## 4. Git Workflow

- Trunk-based: `main` is always releasable; short-lived branches.
- Branch names: `phase-<n>/<topic>`, for example `phase-3/project-card`.
- Commits: Conventional Commits with an area scope, for example `feat(components): add ProjectCard`.
- Pull requests carry the definition-of-done checklist from `AGENTS.md`, link the spec they implement, and list decision-log changes.
- Pre-commit: lint-staged runs Prettier, ESLint and Stylelint on staged files.
- CI on every PR: `verify`, e2e, a11y, Lighthouse, `pnpm audit`.

## 5. Editor Setup

`.editorconfig`, recommended VS Code extensions (Astro, ESLint, Prettier, Stylelint, Tailwind CSS IntelliSense), workspace settings that format on save.

## 6. Agent Setup

- `AGENTS.md` is the only rule file. `CLAUDE.md`, `.cursor/rules` and similar contain one line pointing to it.
- An agent run starts by reading the files in AGENTS.md section 2, then runs `verify` before declaring a task done.
- Agents run the dev server in the background and read the JSON log output rather than scraping terminal text.

## 7. Project Initialised When

Clean install works from a fresh clone; `verify` passes; CI is green; the guardrail lint rules fail on a deliberately bad example (raw hex, `box-shadow`, hardcoded copy) and pass on the real code; pointer files for each agent exist.

## 8. Debug Overlay and Feature Switches

To support profiling, performance diagnosis, and interaction isolation, debug features can be enabled via URL query parameters when running locally in DEV, in E2E testing, or when built with `PUBLIC_ENABLE_DEBUG=true`:
- `?perf=1`: Renders a non-intrusive high-visibility HUD overlay showing real-time FPS, frame duration (ms), max long task in the last 5 seconds (ms), canvas dimensions & DPR, GPU renderer string, runtime quality level, and frame guard status.
- `?fx=off:<name>` or `?fx=off:<name1>,<name2>`: Disables specific interaction subsystems to isolate performance bottlenecks. Supported switches:
  - `digitfield`: disables WebGL canvas initialization.
  - `blur`: disables canvas texture blur filtering.
  - `scrub`: disables statement and bio word scrubbing.
  - `reveal`: disables GSAP scroll reveals and line reveals.
  - `marquee`: disables continuous marquee animation.
  - `cursor`: disables custom cursor dot and follower.
  - `lenis`: disables Lenis smooth scrolling.
  - `tags`: disables keyword floating tag animations.
