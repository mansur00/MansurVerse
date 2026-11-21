# Development Roadmap

> Phase-by-phase plan from specification to launch. An agent works in the current phase only. Each phase ends with an owner approval. Last updated: 2026-11-18.

## Current phase: Phase 1 (Project setup) and Phase 2 (Tokens and foundation) complete; awaiting owner review and approval before starting Phase 3. Runbooks: `docs/05-phases/`.

## Phases

### Phase 0: Specification
**Goal:** every decision and spec is written down before code starts.
**Deliverables:** all docs in the tree below, written in batches and approved by the owner.
**Exit:** all docs approved; no open item in `decision-log.md` blocks Phase 1. (Complete)

### Phase 1: Project setup and tooling
**Goal:** a clean, guarded foundation.
**Deliverables:** Astro + TypeScript project, Tailwind 4, lint/format/type-check, git conventions, CI skeleton, agent pointer files, folder structure, guardrail lint rules (no raw hex or magic px in components, no shadow or border on filled elements).
**Docs:** `tech-stack.md`, `architecture.md`, `dev-environment.md`, `code-standards.md`.
**Exit:** clean build and green CI; guardrails proven with a deliberately failing example. (Complete, awaiting owner sign-off)

### Phase 2: Tokens and foundation
**Goal:** every visual decision exists as a token.
**Deliverables:** token source file generating CSS variables and the Tailwind theme; self-hosted fonts (licences checked); light and dark themes without flash; base styles; layout primitives (container, grid, section); an internal style-guide page showing all tokens.
**Docs:** `design-system.md`, `color-tokens.md`, `typography.md`, `spacing-radius-shadow.md`, `tokens-implementation.md`.
**Exit:** style-guide page matches the docs; theme toggle works. (Complete, awaiting owner sign-off)

### Phase 3: Components (static)
**Goal:** the full component library without motion.
**Deliverables:** nav, button/pill, chip (filled and outlined), keyword tag, "/" label, project card, capability row, process step, stat tile, value row, job row, marquee, form fields, footer, cursor element.
**Docs:** `component-specs.md`, `style-guide.md`, `ui-layout.md`.
**Exit:** every component matches its spec; no hardcoded values. (Complete across 4 feature branches, awaiting owner review)

### Phase 4: Content and pages
**Goal:** every page and section complete with placeholder content.
**Deliverables:** content collections and schemas, site config, all pages and sections from the brief, routing, 404.
**Docs:** `page-specs.md`, `content-schema.md`, `pages-and-routing.md`.
**Exit:** all pages complete without motion; content changes need content files only.

### Phase 5: Motion and interaction
**Goal:** the interaction layer.
**Deliverables:** Lenis and GSAP setup, scroll and text reveals, statement scrub, counters, cursor, magnetic elements, hover previews, filter transitions, page and case-study transitions, compare slider, portrait spotlight, letter repel, form animations, reduced-motion handling.
**Docs:** `interaction-motion.md`, `animation-implementation.md`, `forms-and-integrations.md`.
**Exit:** every interaction in `interaction-motion.md` passes its checklist, including fallbacks.

### Phase 6: Hero WebGL
**Goal:** the binary digit field and hero tags at production quality.
**Deliverables:** WebGL digit field (small, slightly blurred, cursor-reactive), floating keyword tags, throttling, static and no-WebGL fallbacks.
**Exit:** smooth on mid-range devices; fallbacks verified.

### Phase 7: Quality
**Deliverables:** performance pass against the budget, accessibility audit, SEO and Open Graph, cross-browser and responsive QA.
**Docs:** `performance-budget.md`, `accessibility.md`, `seo-and-metadata.md`, `testing-qa.md`.
**Exit:** all budgets and checklists pass.

### Phase 8: Deployment and launch
**Deliverables:** hosting, domain, CI/CD, preview deploys, environment variables, analytics decision, launch checklist.
**Docs:** `deployment.md`, `launch-checklist.md`.
**Exit:** site live; checklist complete.

### Phase 9: Maintenance
**Deliverables:** monitoring, dependency update routine, content workflow.
**Docs:** `maintenance.md`.

## Doc Creation Batches (Phase 0)

| Batch | Files | Status |
|---|---|---|
| 1 | `AGENTS.md`, `project-brief.md`, `development-roadmap.md`, `decision-log.md` | Approved |
| 2 | `design-system.md`, `color-tokens.md`, `typography.md`, `spacing-radius-shadow.md`, `ui-layout.md` | Approved (updated with verified ollyo tokens) |
| 3 | `page-specs.md`, `interaction-motion.md`, `component-specs.md`, `style-guide.md` | Approved |
| 4 | `tech-stack.md`, `architecture.md`, `dev-environment.md`, `code-standards.md`, `tokens-implementation.md` | Approved |
| 5 | `content-schema.md`, `pages-and-routing.md`, `animation-implementation.md`, `forms-and-integrations.md` | Approved |
| 6 | `performance-budget.md`, `accessibility.md`, `seo-and-metadata.md`, `testing-qa.md`, `deployment.md`, `launch-checklist.md`, `maintenance.md` | Approved |

## Doc Tree

```
AGENTS.md
docs/
  00-overview/   project-brief, development-roadmap, decision-log
  01-design/     design-system, color-tokens, typography, spacing-radius-shadow,
                 ui-layout, page-specs, interaction-motion, component-specs, style-guide
  02-engineering/ tech-stack, architecture, dev-environment, code-standards,
                 tokens-implementation, content-schema, pages-and-routing,
                 animation-implementation, forms-and-integrations
  03-quality/    performance-budget, accessibility, seo-and-metadata, testing-qa
  04-release/    deployment, launch-checklist, maintenance
```
