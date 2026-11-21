# Layout System

> The single global system for page layout, spacing and placement. It exists because the Phase 4 preview showed text, forms, cards and buttons touching the viewport edges and sections running into each other: each page and block laid itself out, and nothing applied the layout tokens. From now on **no page, block or component decides its own outer spacing or width**. Layout comes only from the tokens and primitives in this document. Read with `ui-layout.md` (patterns and wireframes), `spacing-radius-shadow.md` (token values) and `AGENTS.md`. Last updated: 2026-11-21.

## 1. Principles

1. **One owner per concern.** `Section` owns the page's horizontal and vertical padding. `Grid` owns column placement. `Stack` owns vertical gaps. Components own only their internal spacing.
2. **No outer spacing on components.** A component never sets its own outer margin, outer padding or width relative to the page. Its parent decides where it sits and how much room it gets.
3. **Everything aligns to one left edge.** The Nav logo, every section's first heading, the footer content and every card row start at the same left edge: `--layout-pad` from the viewport. Right edges follow the same rule.
4. **Tokens or primitives, never raw numbers.** No `px`, `rem`, `em`, `vw`, `vh` or `%` literals for spacing, gaps, offsets or widths in components or pages.
5. **Full-bleed is designed, not accidental.** Only the items listed in section 4.4 may reach the viewport edge.
6. **Pages only compose.** A page file contains primitives, blocks and components. It has no `<style>` block and no layout classes of its own.

## 2. Tokens

Existing (`tokens.json`, group `layout` and `space`):

| Token | Value | Use |
|---|---|---|
| `--layout-pad` | `clamp(16px, 4vw, 48px)` | Horizontal page padding, set only by `Section` (and Nav and Footer through the same primitive) |
| `--layout-section-y` | `clamp(56px, 9vw, 120px)` | Vertical section padding |
| `--layout-gap` | 16px | Gap between cards and tiles |
| `--layout-gap-wide` | 24px | Gap between columns (the gutter) |
| `--layout-nav-height` | 72px | Scroll padding and sticky offsets |
| `--space-1` to `--space-10` | 4px to 128px | Internal component spacing |

New tokens to add to `tokens.json` (values are Assumed from the prototype; verify against ollyo, O-01):

| Token | Value | Use |
|---|---|---|
| `--layout-section-y-compact` | `clamp(24px, 4vw, 48px)` | Marquee and thin bands |
| `--layout-columns` | 12 | Grid column count |
| `--stack-tight` | `var(--space-2)` | Label to its sibling, chips in a row |
| `--stack-base` | `var(--space-4)` | Paragraph to paragraph, title to description |
| `--stack-loose` | `var(--space-6)` | Heading to content |
| `--stack-section` | `var(--space-7)` | Section header block to the section body |
| `--measure-body` | `60ch` | Reading width for body text |
| `--measure-narrow` | `34ch` | Intro and value text |
| `--measure-statement` | `22ch` | Statement sentence |

Placement group (new, in `tokens.json` as `placement`, desktop values; mobile always spans all 12):

| Name | Start | Span | Used for |
|---|---|---|---|
| `full` | 1 | 12 | Full-width content |
| `statement` | 4 | 7 | Home statement (starts about a quarter in) |
| `intro` | 7 | 6 | Hero intro text, right column |
| `label` | 1 | 4 | Label side of label/description rows |
| `text` | 5 | 8 | Description side of label/description rows |
| `half-a`, `half-b` | 1, 7 | 6, 6 | Two equal columns (About, Contact) |
| `meta` | 1 | 3 | Case-study sidebar |
| `body` | 4 | 9 | Case-study body |

`tokens:build` generates these as CSS variables and utility classes; `tokens:check` fails on a missing or invalid entry.

## 3. Rhythm Rules

- Vertical order inside a section: SlashLabel, then heading (`--stack-tight` between), then content (`--stack-loose` between the heading and the content). The whole header block is separated from the section body by `--stack-section`.
- Gaps between sibling cards and tiles use `--layout-gap`; gaps between columns use `--layout-gap-wide`. Columns must never touch: every multi-column layout uses `Grid`, which applies the gutter.
- Text blocks use a `--measure-*` token for `max-width`, never a literal.

## 4. Primitives

All live in `src/components/layout-primitives/` and are listed on `/styleguide` with every variant.

### 4.1 Section

The only element that sets page padding.

| Prop | Values | Notes |
|---|---|---|
| `surface` | `base`, `alt`, `feature`, `feature-dots` | Full-bleed background; also sets the text and divider colour tokens for that surface (see `design-system.md` section 3) |
| `size` | `default`, `compact`, `none` | `default` uses `--layout-section-y`; `compact` the compact token; `none` for the hero and footer, which set their own block padding with tokens |
| `as`, `id`, `aria-labelledby` | | Semantic element and anchor |

Behaviour: `padding-inline: var(--layout-pad)`; `padding-block` from `size`; content area is the full width inside the padding (no centred max-width box, no auto margins). Nav and Footer use the same inline padding through `Section` (or the same token) so their edges match.

### 4.2 Grid and Cell

`Grid` renders a 12-column grid with `column-gap: var(--layout-gap-wide)` and `row-gap: var(--layout-gap)`. `Cell` takes `placement` (a name from section 2) and optional `from` (`tablet` or `desktop`) so it can collapse. Below the `tablet` breakpoint every `Cell` spans all 12 columns. No literal column numbers in components; placements are names.

### 4.3 Stack and Cluster

`Stack` is a vertical flow with a `gap` prop of `tight`, `base`, `loose` or `section` mapped to the stack tokens. `Cluster` is a wrapping row (chips, tags, links) with `gap` from the same tokens.

### 4.4 Bleed

The only way to leave the padding box. Allowed uses, exhaustive:

| Use | Notes |
|---|---|
| Section backgrounds | Provided by `Section` |
| Marquee | Runs edge to edge inside its `Section` |
| Art inside a project card | Bleeds inside the card only, never past the card |
| Hero digit field | Background layer |
| Stat tiles row on the Numbers section, if the design calls for it | Must be logged in `page-specs.md` |

Anything else needing to bleed requires a decision-log entry.

## 5. Rules (the checklist agents follow)

**Must**
- Wrap every page section in `Section`; use `Grid`, `Cell`, `Stack` and `Cluster` for everything inside it.
- Put multiple columns in a `Grid`; give text a `--measure-*` width.
- Keep component-internal spacing on `--space-*` tokens.
- Keep first headings and text on the same left edge as the Nav logo.

**Must not**
- Set `padding`, `margin`, `gap`, `inset`, `top/right/bottom/left`, `width` or `max-width` with literal units on a page or in a block.
- Use negative margins outside `Bleed`.
- Add `max-width` plus `margin: 0 auto` containers (no centred boxes; the system is left-aligned and asymmetric).
- Put a `<style>` block with layout in a page file.
- Use `100vw` for widths (it causes horizontal scroll); use the grid or `100%`.
- Give a component an outer margin.

Exceptions: decorative art positioning inside `ProjectCard`, `PixelShape` and `KeywordTag` may use percentages; these files are allow-listed in `stylelint.config.mjs` and named in `decision-log.md`.

## 6. Application Map

| Page | Sections and primitives |
|---|---|
| Home | Hero: `Section size=none` with `Grid` (heading `full`, intro `intro`); Statement: `Cell placement=statement`; Selected work, Capabilities, Process, Values, Numbers, Marquee (`size=compact`), Contact CTA each in a `Section` with the surface from `design-system.md` section 3 |
| Work | Header and toolbar in a `Section`; project cards in a `Grid` (two `half` cells, or one `full` cell in list mode); then the shared blocks |
| Case study | `Grid` with `meta` and `body` cells; compare slider and results inside `body`; shared blocks below |
| About | `Grid` with `half-a` (portrait) and `half-b` (text) so a gutter always exists; then Experience, shared blocks |
| Contact | `Grid` with `half-a` (form) and `half-b` (availability, email, elsewhere) |
| 404 | One `Section` |
| Footer | `Section size=none` with the same inline padding as Nav; `Grid` for the three columns |

## 7. Responsive Behaviour

| Breakpoint | Rule |
|---|---|
| Mobile (up to 720px) | Every `Cell` spans 12; two-up grids become one column; stat tiles and process steps become two columns; `--layout-pad` stays; nothing may exceed the viewport width |
| Tablet (721 to 1100px) | Placements apply as on desktop unless a `Cell` sets `from=desktop` |
| Desktop (1101px and up) | Full placements |

## 8. Enforcement

| Mechanism | What it checks |
|---|---|
| Stylelint | A property rule that rejects literal lengths (`px`, `rem`, `em`, `vw`, `vh`, `%`) in `margin`, `padding`, `gap`, `row-gap`, `column-gap`, `inset`, `top`, `right`, `bottom`, `left`, `width` and `max-width` outside the allow-listed files. Values containing `var(` or `calc(var(` pass |
| Stylelint | Rejects `margin: 0 auto` and negative margins outside `Bleed` |
| ESLint (Astro) | Pages and blocks may not import their own `<style>` or `class` layout utilities; only primitives, blocks and components |
| `check-conventions.mjs` | Every page section is a `Section`; no page or block sets outer padding; the Footer and Nav use the same inline-padding token |
| Playwright (CI) at 375, 768, 1280 and 1920px | (a) the first heading or text of every section starts at the Nav logo's left edge within 1px; (b) no visible element extends past viewport width minus the right padding, except Bleed items; (c) each section's computed top padding equals its `size` token value; (d) no horizontal scroll. Failures print the offending selector |
| `/styleguide` | A layout section demonstrates Section, Grid and Cell, Stack, Cluster and Bleed at all breakpoints |

## 9. Known Defects to Fix With This System (review of 2026-11-21)

1. Text, forms, cards, tiles and buttons touch both viewport edges on Home, Work, About and Contact.
2. Sections have no vertical padding and run into each other.
3. Project cards run edge to edge; they must sit inside the page padding (art may bleed inside the card).
4. About: no gutter between portrait and text. Contact: no gutter between the form and the info column.
5. Home statement and the Numbers heading sit in a very narrow column and wrap about one word per line.
6. Footer content sits in a centred box with a different left edge from the Nav.
7. Capabilities numbers are superscripts after the title; the Work count is a small superscript.

## 10. Adding or Changing a Section

1. Decide its surface from `design-system.md` section 3 and its placements from section 2 above.
2. Build it from `Section`, `Grid`, `Cell`, `Stack`, `Cluster`; create no new layout CSS.
3. If a needed placement or gap does not exist, add it to `tokens.json` (and this document), not to the component, then log the decision.
4. Add it to `/styleguide` and run the layout tests.

## 11. Change Process

Changing a layout token or placement means: edit `tokens.json`, run `tokens:build` and `tokens:check`, update this document and `ui-layout.md`, log the decision in `decision-log.md`, and check all pages at all four test widths.
