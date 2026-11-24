# Layout System

> The single global system for page layout, spacing and placement, verified and adopted from ollyo.com layout DevTools measurements (see `ollyo-layout-reference.md`). Layout comes strictly from the tokens and primitives in this document. From now on **no page, block or component decides its own outer spacing or width**. Read with `ollyo-layout-reference.md`, `ui-layout.md`, `spacing-radius-shadow.md` and `AGENTS.md`. Last updated: 2026-11-24.

## 1. Principles

1. **One owner per concern.** `Section` owns full-bleed background surfaces and vertical padding. `Container` owns the centered layout width and horizontal padding. `Grid` owns column placement. `Stack` owns vertical gaps. Components own only their internal spacing.
2. **No outer spacing on components.** A component never sets its own outer margin, outer padding or width relative to the page. Its parent decides where it sits and how much room it gets.
3. **Everything aligns to one left edge.** The Nav logo, every section's first heading, the footer content and every card row start at the same left edge inside `Container`. Right edges follow the same symmetrical rule.
4. **Tokens or primitives, never raw numbers.** No `px`, `rem`, `em`, `vw`, `vh` or `%` literals for spacing, gaps, offsets or widths in components or pages.
5. **Full-bleed is designed, not accidental.** Only items inside `Section` without `Container` (or via `Bleed`) reach the viewport edge.
6. **Pages only compose.** A page file contains primitives, blocks and components. It has no layout classes or custom margins of its own.

## 2. Tokens

Layout group (`tokens.json`, group `layout` and `breakpoint`):

| Token | Value | Use | Source |
|---|---|---|---|
| `--layout-container-max` | `1539px` | Maximum container width for viewports > 991px | Verified (ollyo.com) |
| `--layout-container-max-narrow` | `800px` | Maximum container width for viewports $\le$ 991px | Verified (ollyo.com) |
| `--layout-pad` | `20px` | Fixed horizontal padding inside `Container` | Verified (ollyo.com) |
| `--layout-hero-top` | `200px` | Page top to first hero line (> 991px) | Verified (ollyo.com) |
| `--layout-hero-top-narrow` | `142px` | Page top to first hero line ($\le$ 991px) | Verified (ollyo.com) |
| `--layout-hero-bottom` | `120px` | Hero bottom padding | Verified (ollyo.com) |
| `--layout-section-y` | `clamp(56px, 9vw, 120px)` | Vertical section padding | Assumed |
| `--layout-section-y-compact` | `clamp(24px, 4vw, 48px)` | Marquee and thin bands | Assumed |
| `--layout-gap` | `16px` | Gap between cards and tiles | Assumed |
| `--layout-gap-wide` | `24px` | Gap between columns (the gutter) | Assumed |
| `--layout-nav-height` | `72px` | In-flow sticky nav height | Assumed |
| `--layout-columns` | `12` | Grid column count | Assumed |
| `--breakpoint-desktop` | `992px` | Desktop min-width (narrow range upper bound is 991px) | Verified (ollyo.com) |
| `--breakpoint-tablet` | `768px` | Tablet min-width | Assumed |

Placement group (`tokens.json` as `placement`, desktop values; narrow always spans all 12):

| Name | Start | Span | Used for |
|---|---|---|---|
| `full` | 1 | 12 | Full-width content |
| `statement` | 4 | 7 | Home statement (spans cols 4 to 10 on desktop, full width on narrow) |
| `intro` | 7 | 6 | Hero intro text, right column |
| `label` | 1 | 4 | Label side of label/description rows |
| `text` | 5 | 8 | Description side of label/description rows |
| `half-a`, `half-b` | 1, 7 | 6, 6 | Two equal columns (About, Contact) |
| `meta` | 1 | 3 | Case-study sidebar |
| `body` | 4 | 9 | Case-study body |

## 3. Rhythm Rules

- Vertical order inside a section: SlashLabel, then heading (`--stack-tight` between), then content (`--stack-loose` between the heading and the content). The whole header block is separated from the section body by `--stack-section`.
- Content left and right edges derived formula:
  - $992\text{px} \le V \le 1539\text{px} \implies \text{edge} = 20\text{px}$
  - $V > 1539\text{px} \implies \text{edge} = (V - 1539) / 2 + 20\text{px}$ (e.g., 210.5px at 1440/1920)
  - $801\text{px} \le V \le 991\text{px} \implies \text{edge} = (V - 800) / 2 + 20\text{px}$
  - $V \le 800\text{px} \implies \text{edge} = 20\text{px}$
  - Right edge is symmetrical: content ends at $V - \text{edge}$.

## 4. Primitives

All live in `src/components/layout-primitives/` and are listed on `/styleguide` with every variant.

### 4.1 Section

Full-bleed background surface and vertical padding ONLY.

| Prop | Values | Notes |
|---|---|---|
| `surface` | `base`, `alt`, `feature`, `feature-dots` | Full-bleed background |
| `size` | `default`, `compact`, `hero`, `none` | `default` uses `--layout-section-y`; `compact` uses `--layout-section-y-compact`; `hero` uses `--layout-hero-top` minus nav height; `none` removes vertical padding |
| `as`, `id`, `aria-labelledby` | | Semantic element and anchor |

### 4.2 Container

The ONLY element allowed to use auto margins (`margin-inline: auto`).

| Prop | Values | Notes |
|---|---|---|
| `as` | `div`, `header`, `footer`, `nav`, `main`, `section` | Semantic element |
| `class` | string | Optional class name |

Behaviour: `width: 100%`, `max-width: var(--layout-container-max)` (800px at $\le 991$px), `margin-inline: auto`, `padding-inline: var(--layout-pad)`. Nav, Footer, and all page sections place content inside `Container`.

### 4.3 Grid and Cell

`Grid` renders a 12-column grid with `column-gap: var(--layout-gap-wide)` and `row-gap: var(--layout-gap)`. `Cell` takes `placement` and optional `from` (`tablet` or `desktop`).

### 4.4 Stack and Cluster

`Stack` is a vertical flow (`tight`, `base`, `loose`, `section`). `Cluster` is a wrapping row with gaps from the same tokens.

### 4.5 Bleed

The only way to leave the container padding box for full-width elements (e.g. Marquee).

## 5. Rules (the checklist agents follow)

**Must**
- Wrap every section's content in `Container`.
- Put multi-column layouts in `Grid`.
- Keep component-internal spacing on `--space-*` tokens.
- Keep first headings and text aligned to the `Container` left edge.

**Must not**
- Use `margin: 0 auto` or `margin-inline: auto` anywhere outside `Container.astro`.
- Set literal widths or padding.
- Break alignment between Nav, content sections, and Footer.

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
