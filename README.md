# MansurVerse Portfolio

UI-design-focused personal portfolio (Astro, TypeScript, Tailwind 4, GSAP, Lenis, WebGL). Visual reference: ollyo.com.

## Start here

- **Agents:** read `AGENTS.md` first. It is the only rule file; `CLAUDE.md`, `.cursor/rules` and `.github/copilot-instructions.md` point to it.
- **Owner:** follow the phase runbooks in `docs/05-phases/`, starting with `phase-1-project-setup.md`.

## Where things are

| Path | Content |
|---|---|
| `docs/00-overview/` | Project brief, roadmap (current phase), decision log |
| `docs/01-design/` | Design system, tokens, typography, layout, page specs, interactions, components, style guide |
| `docs/02-engineering/` | Tech stack, architecture, dev environment, code standards, token pipeline, content schema, routing, animation, forms |
| `docs/03-quality/` | Performance budget, accessibility, SEO, testing |
| `docs/04-release/` | Deployment, launch checklist, maintenance |
| `docs/05-phases/` | Step-by-step runbooks per phase |
| `reference/portfolio-prototype.html` | Approved visual and interaction prototype (reference only) |
| `src/`, `scripts/`, `tests/` | Code scaffold, token pipeline, guardrail tests |

## Status

Phase 0 (specification) complete. Phase 1 and Phase 2 code is written and awaiting verification on a machine with network access (`pnpm run verify`). See `docs/00-overview/development-roadmap.md`.
