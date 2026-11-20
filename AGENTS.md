# AGENTS.md

Entry point for every AI agent (and human) working in this repository. Read this file first, then follow the reading order. Other agent files (`CLAUDE.md`, `.cursor/rules`, etc.) must only point here so the rules live in one place.

## 1. What this project is

A UI-design-focused personal portfolio for a frontend designer + developer. It must feel modern, fancy and highly interactive. The visual and structural reference is ollyo.com: its layout style, typography roles and flat-fill look are copied; its copy and assets are not.

Approved visual reference: the prototype at https://claude.ai/artifact/93aQ1n1oAjXdLc9L8YuRaK (source: `portfolio-prototype.html`). The prototype is a design reference only, never production code.

## 2. Reading order

1. `docs/00-overview/project-brief.md` (scope, pages, sections, features)
2. `docs/00-overview/development-roadmap.md` (find the current phase and which docs exist)
3. `docs/00-overview/decision-log.md` (what is decided, assumed or open)
4. The specs for the task at hand (`docs/01-design/*`, `docs/02-engineering/*`, ...)

If a spec you need does not exist yet, stop and ask the owner. If you must proceed, record the assumption in `decision-log.md` as "Assumed".

## 3. Hard rules (non-negotiable)

1. **No hardcoding.** Colors, fonts, sizes, spacing, radii, durations and easings come from design tokens. Copy, links, images and project data come from content files. Navigation, SEO defaults, site name and social links come from site config. Once tooling exists, lint must reject raw hex values and magic pixel numbers in components.
2. **Flat look.** No `box-shadow`, `text-shadow` or drop-shadow filters. No border or stroke on a filled element. An outlined element (for example an outlined chip) has a transparent background. The only line allowed is the hairline divider token (list rows, footer).
3. **Typography roles.** `h1` uses Jersey 20 (the display token) and is the only text element that does, apart from "Mansur" in the wordmark ("Verse" is Stack Sans Notch). `h2` to `h6`, small uppercase labels and stat numbers use Stack Sans Notch. Body and long text use Plus Jakarta Sans. No other fonts.
4. **Shapes.** Cards and tiles have sharp corners. Chips, buttons and pills are fully rounded. Decorative shapes are pixel-stepped and flat-filled.
5. **English only.** All visible text lives in content files.
6. **Accessibility and motion.** Every animation has a `prefers-reduced-motion` fallback. WebGL has a no-WebGL fallback. The custom cursor exists only for fine pointers. Focus is always visible. Use semantic HTML.
7. **Performance.** Follow `docs/03-quality/performance-budget.md`. Ship JavaScript only where interaction needs it (Astro islands with `client:visible` or `client:idle`).
8. **Dependencies.** Only those listed in `docs/02-engineering/tech-stack.md`. Adding one needs a decision-log entry.
9. **Specs are the source of truth.** If code and spec disagree, fix the code, or update the spec in the same change and log the decision.
10. **Do not invent.** Missing or ambiguous spec means ask, not guess.

## 4. Workflow

- Work phase by phase as laid out in the roadmap. Do not pull later-phase work forward unless the owner asks.
- For each task: read the spec, implement, check against the definition of done, update the docs, log decisions.
- Small commits with imperative messages. The exact convention will be fixed in `code-standards.md`.
- The owner approves each batch of spec files and each phase exit.

## 5. Planned repository map

Planned only; `architecture.md` confirms it.

- `AGENTS.md`
- `docs/` (all specs)
- `src/config/` (site config)
- `src/content/` (projects, profile and other content as MDX/JSON, validated by schemas)
- `src/styles/tokens/` (token source and generated variables)
- `src/components/`, `src/layouts/`, `src/pages/`
- `src/scripts/` (motion, cursor, WebGL)

## 6. Definition of done (every task)

- Matches its spec and uses tokens only; no hardcoded values.
- Correct at mobile, tablet and desktop widths, in light and dark themes.
- Reduced-motion and no-WebGL fallbacks verified.
- Lint, type-check and build pass (commands are defined in `dev-environment.md` once the project is initialised).
- Docs and `decision-log.md` updated.
- Performance and accessibility budgets respected for every touched page.
