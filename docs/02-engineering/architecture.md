# Architecture

> How the code is organised, how data flows, and where interactivity lives. Last updated: 2026-11-19.

## 1. Principles

1. **Content, config and tokens are data; components are logic.** Changing words, projects or colours never touches component code.
2. **Static first.** Pages are rendered at build time; JavaScript is added per component, only when needed.
3. **One source per concern.** Tokens in the token source, copy in content files, site-wide settings in config.
4. **Motion is a layer.** Pages work without it; motion attaches through attributes and a single registry.

## 2. Layers (dependencies point downward only)

```
pages  ->  layouts  ->  components  ->  tokens (generated CSS and TS)
  |                         |
  +-----> content + config -+
scripts (motion, webgl, cursor, theme) attach to components via data attributes
```

## 3. Repository Map

```
AGENTS.md
docs/
src/
  config/
    site.ts                 nav, SEO defaults, footer, CTA, timezone, not-found copy
  content/
    projects/               one MDX or JSON file per project
    home.json, profile.json, capabilities.json, process.json,
    values.json, stats.json, experience.json, skills.json, open-to.json
  content.config.ts         collections and Zod schemas (confirm Astro 7 location at init)
  styles/
    tokens/tokens.json      token source of truth
    tokens/generated/       generated CSS variables, Tailwind theme, TS constants (never edit)
    base.css, fonts.css
  components/
    primitives/             Button, Chip, KeywordTag, SlashLabel, PixelShape, Divider, Logo
    layout/                 Nav, MenuOverlay, Footer, SectionHeader, CTABand
    content/                ProjectCard, CapabilityRow, ProcessStep, ValueRow, StatTile, JobRow, ...
    forms/                  Form, FormField
    motion/                 DigitField, Marquee, CompareSlider, PortraitSpotlight, Cursor
  layouts/BaseLayout.astro
  pages/                    index, work/index, work/[slug], about, contact, 404, styleguide
  scripts/
    motion/                 ticker, lenis, registry, reveal, text-split, scrub, counters, magnetic, ...
    webgl/                  digit-field
    theme.ts                inline pre-paint theme script
  assets/                   images, fonts
public/                     static files (favicons, OG fallbacks)
tests/                      unit, e2e, a11y
```

## 4. Rendering and Islands

| Component | Hydration | Reason |
|---|---|---|
| Nav (menu overlay) | `client:idle` | Interactivity not needed at first paint |
| ThemeToggle | Inline script plus tiny island | Theme must apply before paint |
| DigitField | `client:load` with deferred init (idle callback) | Above the fold but non-critical; static fallback in HTML |
| Cursor | `client:media="(pointer: fine)"` | Fine pointers only |
| FilterBar, ViewToggle | `client:visible` | Work page only |
| CompareSlider, Form | `client:visible` | Below the fold |
| Marquee, StatementText, CapabilityRow | CSS plus a small script, no framework island | Cheap |

Framework islands are used only if a component needs component-level state; otherwise plain scripts attach to `data-` attributes.

## 5. Motion System

- A single module owns the ticker (GSAP ticker driving Lenis).
- Interactions register through a registry keyed by `data-motion="<name>"`; each registration has `init(root)` and `cleanup()`.
- `gsap.matchMedia()` gates everything: reduced motion, coarse pointer and low-power conditions pick the fallback branch from the matrix in `interaction-motion.md`.
- Route changes call `cleanup()` then `init()` for the incoming page (details in `animation-implementation.md`).
- Durations and easings come from the generated motion tokens, never literals.

## 6. State

- Theme and motion preferences live as attributes on `<html>` (`data-theme`, `data-motion`).
- Persistence uses `localStorage` inside try/catch; the site must work if storage is unavailable.
- No global client state store. Page-level state (filter, view mode) lives in its island.

## 7. Content Flow

Content files, then Zod validation at build, then typed queries in pages, then components receive typed props. Invalid or missing required content fails the build with a readable error. Accent colours in content are token names from a fixed enum, never colour values.

## 8. Build and Quality Gates

Build runs: token build and check, type check, lint (ESLint, Stylelint), unit tests, Astro build, then in CI e2e, a11y and Lighthouse checks. Details in `dev-environment.md`.

## 9. Agent Friendliness

Astro 7's agent detection, background dev server and JSON logs are used for agent runs. Specs in `docs/` are the contract; schemas and lint rules make mistakes fail loudly.
