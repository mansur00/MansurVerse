# Component Specs

> Anatomy, variants, states, token bindings and rules for every component. Components consume layer 2 and 3 tokens only (`design-system.md`). Outer placement and spacing are governed strictly by `docs/01-design/layout-system.md`. Sizes marked Assumed come from the prototype. Last updated: 2026-11-21.

## 1. Conventions

- Props: `as` sets the HTML element; `role` (text role) sets the look; variants are explicit string props.
- Every interactive component has hover, focus-visible, active and disabled states. Hover-only reveals have focus and tap equivalents.
- No component contains raw colours, sizes, copy or links.

## 2. Primitives

| Component | Anatomy | Variants and states | Tokens | Notes |
|---|---|---|---|---|
| Logo | "Mansur" (Jersey 20, 400, 2.2rem) + "Verse" (Stack Sans Notch, 700, 1.5rem), one baseline, no space | Link to `/`; focus-visible | `--font-display`, `--font-label`, `--color-text-primary` | Assumed sizes, confirm visually. Clear space equals the height of "M". `aria-label="MansurVerse, home"` |
| Button (pill) | Rounded pill, label, optional pixel arrow | `primary` (lime fill, black text), `inverse` (forest fill, lime text), `outlined` (transparent, hairline stroke); hover, focus, active, disabled, loading, success | `--button-*`, `--radius-pill`, `chip` text role | Padding 12px 22px (Assumed); magnetic (I-12) |
| Chip | Rounded label | `filled` (alt grey), `accent` (lime), `outlined` (transparent, hairline stroke); `active` for filters | `--chip-*`, `--radius-pill` | A filled chip never has a stroke |
| KeywordTag | Sharp rectangle, text | Colour from `--tag-bg-1` to `-4`; hover scale 1.15 | `tag` text role, `--z-tag` | Padding 6px 14px (Assumed); floats (I-06) |
| SlashLabel | Lime "/" + uppercase label | On light or feature surfaces | `label` text role | One per section, above the heading |
| SuperscriptNumber | Small muted number | Zero-padded | `--color-text-muted` | Decorative; `aria-hidden` where redundant |
| PixelShape | Flat shape with stepped edges | `blob`, `corner`; colour from an accent token | `--shape-*`, `--opacity-shape` | Decorative; `aria-hidden` |
| Divider | 1px line | On base, on feature | `--color-divider`, `-on-feature` | Only allowed line besides listed exceptions |
| Cursor | 14px dot to 84px pill | Idle, label | `--z-cursor` | Fine pointers only (I-11) |

## 3. Layout and Navigation

| Component | Anatomy | States | Notes |
|---|---|---|---|
| Nav | Logo left, links and ThemeToggle right | Visible, hidden on scroll, menu open | Sticky at the safe-area top; base-colour cover bar behind the status area |
| MenuOverlay | Full-screen base surface, large links | Open, closed | Esc closes; focus trap; entrance stagger 80ms |
| ThemeToggle | Button with accessible name "Toggle theme" | Light, dark | Persists choice (I-01) |
| SectionHeader | SlashLabel + heading (`heading-section`) | | Heading level is chosen per page for correct outline |
| Footer | Three columns: pages, elsewhere, local time; copyright | | Collapses to one column on mobile |
| CTABand | Centred label, heading, text, primary Button | | Content from `site.cta` |
| MotionToggle | Button labelled "Pause motion" or "Play motion", in the footer | On, off | Sets `data-motion` on `<html>`, persists (I-37); state also follows `prefers-reduced-motion` |

## 4. Content Components

| Component | Anatomy | Variants and states | Tokens | Notes |
|---|---|---|---|---|
| ProjectCard | White card; number, title (`heading-card`), description, chips; art on the right: half-pill colour block, pixel blob, image on top | `stack` (full width), `grid`, `list` (no art, one row); hover, focus-visible | `--card-*`, `--shape-*`, accent from `project.accent` | Sharp corners, no shadow or border. Two columns (1fr and 1.15fr) on desktop, stacked on mobile with 240px art. Whole card is one link |
| CapabilityRow | Title, superscript number, collapsible description | Closed, open, focus | `heading-row`, `--color-divider-on-feature` | Button semantics (`aria-expanded`); no JS: open |
| ProcessStep | Large number, title, text | | `--color-bg-surface`, `heading-step`, label font for the number | |
| ValueRow | SlashLabel left, text right | | `value-text` | |
| StatTile | Number, caption | `lime`, `white`; staggered offset on even tiles | `stat`, `--stat-tile-*` | Sharp corners. Counter (I-17); final value in the accessible name |
| JobRow | Category label, title and meta, pill | | `heading-job`, Divider | Pill links to contact |
| Marquee | Repeating names, "/" separators, superscript numbers | | | `aria-hidden`; static under reduced motion |
| StatementText | Words as spans; inline blocks | Unfilled, filled | `statement` role | Spans are presentational; the full sentence stays readable as one text node for assistive tech |
| EmailDisplay | Email as letters inside one `mailto:` link | Idle, repelled | `email-display` role | Accessible name is the full address |
| PortraitSpotlight | Portrait image, duotone base, masked colour layer | Pointer, touch | `--color-bg-feature` | 4/5 aspect ratio; alt text required |
| ExperienceRow | Period, role, place | Hover dims others | Divider | |
| SkillChips | Chips | Static; optional physics | | |
| MetaSidebar | Role, year, tools, links; section list | Active section | `label` role | Sticky on desktop; static on mobile |
| CompareSlider | Two layers, range input, handle line | Dragging | `--color-focus` | `aria-label` "Compare before and after" |
| DigitField | Canvas or WebGL layer behind the hero | Active, static fallback | `--color-digit-field`, `--opacity-digit-field` | `aria-hidden`; pauses offscreen |

## 5. Forms

| Component | Anatomy | States |
|---|---|---|
| FormField | Floating label, input or textarea, message line | Idle, focus, filled, error, disabled |
| Form | Fields plus submit Button | Idle, sending, sent, failed |

Inputs: sharp corners, filled background (`--color-bg-alt`), no border; focus uses the focus ring. Errors use text plus an icon, never colour alone. Each input has a real `<label>` and `autocomplete` where applicable.

## 6. Filters and Toggles

| Component | Anatomy | Notes |
|---|---|---|
| FilterBar | Chips from `projects` categories; "All" first | `aria-pressed`; count in `aria-live` |
| ViewToggle | Chip button "List view" or "Grid view" | Announces the new state |

## 7. Definition of Done (component)

Matches its row; tokens only; hover, focus, active, disabled states; keyboard and screen-reader behaviour; works in both themes; reduced-motion and touch rules from `interaction-motion.md`; listed on the internal style-guide page.
