# Design System

> Foundation for every visual decision. Read with `color-tokens.md`, `typography.md`, `spacing-radius-shadow.md` and `ui-layout.md`. Values marked "Assumed" come from the approved prototype and must be verified against ollyo.com (decision-log O-01). Last updated: 2026-11-18.

## 1. Principles

1. **Flat.** Colour blocks, not elevation. No shadows, no strokes on filled elements.
2. **Typographic.** Big type is the main visual. Headings are large, tight and confident.
3. **Colour-blocked.** Sections alternate backgrounds (light, mid grey, charcoal); lime is the signature accent.
4. **Pixel-accented.** Pixel-stepped shapes and the Jersey 20 `h1` give the brand its personality.
5. **Structured.** "/" labels, superscript numbers and numbered lists make the layout feel engineered.
6. **Interactive but quiet.** Motion supports clarity; it never blocks reading or interaction.
7. **Token-driven.** If a value is visual, it is a token. Components never contain raw values.

## 2. Token Architecture

Three layers. Components use only layers 2 and 3.

| Layer | Example | Purpose |
|---|---|---|
| 1. Primitive | `--palette-lime-500` | Raw palette and scale values; never used in components |
| 2. Semantic | `--color-accent-primary`, `--color-bg-alt` | Meaning, switches with theme |
| 3. Component | `--card-bg`, `--chip-accent-bg` | Per-component bindings to semantic tokens |

Naming: `--{category}-{role}-{variant}`. Categories: `palette`, `color`, `font`, `text`, `space`, `radius`, `line`, `shape`, `z`, `layout`, `motion` (motion tokens are defined in `interaction-motion.md`).

The token source is a single file (format fixed in `tokens-implementation.md`) that generates CSS variables and the Tailwind theme. Never edit generated output.

## 3. Surfaces and Section Rhythm

| Surface | Use | Text |
|---|---|---|
| `base` | Default page background | ink |
| `alt` | Mid-grey band for contrast | ink |
| `dark` | Charcoal feature sections | white |
| `card` | White project cards (fixed white in both themes) | ink |
| `accent tile` | Lime or white stat tiles | ink |

Home rhythm: base (hero) → base (statement) → alt (work) → dark (capabilities) → base (process) → dark (values) → dark with dot texture (numbers) → base (marquee) → alt (contact CTA) → base (footer). Two dark sections may touch only if the second has the dot texture or a clear tonal shift.

## 4. Accent Usage

- **Lime:** primary accent. Primary pill buttons, active filter chip, accent chip on cards, "/" glyph, stat tiles, availability dot, cursor.
- **Sky blue, yellow-lime, pink, cyan and blue:** secondary accents. Keyword tags, project accent shapes, decorative blocks. Sky `#4BC3FF` and yellow-lime `#B7F626` are verified from ollyo; pink, cyan and blue are Assumed.
- One accent per component. Text on any accent is ink, except white on blue.
- Accents keep their value in both themes.

## 5. Motif Library

| Motif | Rule |
|---|---|
| **Slash label** | Small uppercase label, Stack Sans Notch, prefixed with a lime "/". One per section above the heading. |
| **Superscript number** | `01`, `02` after a title or list item; small, muted. |
| **Keyword tag** | Sharp rectangle, filled with an accent colour, ink text, sits on top of a heading. Floats gently (motion in `interaction-motion.md`). |
| **Pixel shapes** | Flat fill, stepped edges, defined as named shape tokens (below). |
| **Inline shape** | Square block (icon or image) set inside a sentence at text height. |
| **Stat tile** | Sharp rectangle, lime or white, large number, caption; tiles are staggered vertically. |
| **Chips** | Fully rounded. Filled (grey), accent (lime), outlined (transparent, hairline stroke). |
| **Pill button** | Fully rounded, lime fill, ink text. Inverse variant for light surfaces: forest fill `#0F1F05` (verified in ollyo's variables), lime text. |
| **Arrows** | Pixel-style arrows (↗ →) for links and CTAs. |

### Shape tokens

| Token | Polygon (clip-path) | Use |
|---|---|---|
| `--shape-pixel-blob` | `polygon(0 40%,20% 40%,20% 20%,40% 20%,40% 0,100% 0,100% 100%,40% 100%,40% 80%,20% 80%,20% 60%,0 60%)` | Behind project images |
| `--shape-pixel-corner` | `polygon(0 0,100% 0,100% 60%,80% 60%,80% 80%,60% 80%,60% 100%,0 100%)` | Corner accents |
| `--shape-half-pill` | `border-radius: 999px 0 0 999px` | Large colour block behind images |

## 6. Imagery

- Project images sit on top of a flat colour shape and a pixel shape; the image itself has no shadow or border.
- Portraits use a duotone base with a colour reveal under the cursor.
- Images are served in modern formats with explicit dimensions (see `performance-budget.md`).

## 7. Theme Parity

Every semantic colour has a light and a dark value. Accents, white cards and stat tiles do not change between themes. Contrast requirements apply in both themes (see `color-tokens.md`).

## 8. Anti-Generic Checklist

A component or page fails review if it has any of: a drop shadow; a border on a filled element; rounded corners on a card; a font outside the three; a centred, symmetric hero with a stock gradient; icon-in-circle feature grids; hardcoded colours or sizes; uniform section backgrounds; headings smaller than the spec.

## 9. Governance

Changing a token means: edit the token source, update the relevant doc, log the decision in `decision-log.md`. Adding a token needs a reason in the doc. Removing a token needs a search proving it is unused.
