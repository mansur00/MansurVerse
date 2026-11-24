# ollyo.com Layout Reference

> Verified layout measurements copied by the owner from ollyo.com with browser DevTools (Styles panel of three elements), 2026-11-24. These replace the layout values we had assumed. Rule from the owner: copy ollyo's layout "same to same". Anything not listed here is still **Assumed** and must be marked as such in the docs.

## 1. Verified Values

### Page body

| Property | Value |
|---|---|
| Page background | `rgba(241, 241, 241, 1)` (#F1F1F1) |
| Text colour | `#000` |
| Theme wrapper font | "Plus Jakarta Sans", weight 400 |
| Theme wrapper overflow | `hidden` (hides any horizontal overflow) |
| Base line height | 1.5 |
| Font smoothing | antialiased (`-webkit-font-smoothing`, `-moz-osx-font-smoothing: grayscale`) |
| Text rendering | `optimizeSpeed` |
| Reset | `box-sizing: border-box; margin: 0; padding: 0` on everything |
| Scrolling | CSS `scroll-behavior: smooth` (we do not adopt this; Lenis handles scrolling, decision D-32) |
| Plus Jakarta Sans files | static TTF files per weight (for example 200), `font-display: swap` |

### Hero section (`.ollyo_hero-section`)

| Viewport | Padding (top right bottom left) | Margin |
|---|---|---|
| Above 991px | `200px 0 120px 0` | 0 |
| 991px and below | `142px 0 120px 0` | 0 |

The section has no side padding. Horizontal spacing comes from the container inside it.

### Container (`.ollyo_dp1l9cin`)

| Viewport | Width | Max width | Padding | Margin |
|---|---|---|---|---|
| Above 991px | 100% | 1539px | `0 20px` | `0 auto` |
| 991px and below | 100% | 800px | `0 20px` | `0 auto` |

### Breakpoint

The one breakpoint seen in these panels is `max-width: 991px`.

## 2. Where the Content Edge Sits (derived)

Let V be the viewport width.

| V | Container width | Content left edge |
|---|---|---|
| 992 to 1539px | V | 20px |
| above 1539px | 1539px | (V - 1539) / 2 + 20 (for example 210.5px at 1920) |
| 801 to 991px | 800px | (V - 800) / 2 + 20 |
| 800px and below | V | 20px |

The right edge is symmetrical: content ends 20px before the container's right edge.

## 3. Differences From What We Had

| Topic | Our previous assumption | ollyo (verified) |
|---|---|---|
| Side padding | `clamp(16px, 4vw, 48px)`, fluid | 20px, fixed |
| Content width | Full width, no centred box (our rule) | Centred container, max 1539px (800px at 991px and below) |
| Hero padding | Same as other sections (`--layout-section-y`) | Top 200px (142px at 991px and below), bottom 120px |
| Breakpoints | 721px and 1101px | 991px (single breakpoint seen) |
| Who owns side padding | `Section` | The container inside the section |
| Auto margins | Forbidden | Used by the container only |

## 4. Decision (to apply in the repository)

Adopt the verified values. New and changed tokens in `tokens.json` (group `layout`, plus breakpoint):

| Token | Value |
|---|---|
| `layout.container-max` | 1539px |
| `layout.container-max-narrow` | 800px (used at 991px and below) |
| `layout.pad` | 20px |
| `layout.hero-top` | 200px |
| `layout.hero-top-narrow` | 142px (used at 991px and below) |
| `layout.hero-bottom` | 120px |
| `breakpoint.desktop` | 992px (min-width), so 991px is the upper edge of the narrow range |

Primitives: `Section` keeps the full-bleed background and the vertical padding only; a new `Container` primitive sets `width: 100%`, `max-width` from the tokens, `padding-inline: var(--layout-pad)` and `margin-inline: auto`. `Container` is the only file allowed to use auto margins (file-scoped Stylelint exception). Nav, Footer and every page section place their content in a `Container`, so all left edges match.

Hero: the distance from the top of the page to the first hero line is 200px (142px at 991px and below) and the bottom padding is 120px, whether or not the nav is sticky. Because our nav is sticky and in the flow, subtract the nav height from the top padding, or make the nav overlay the hero.

## 5. Still Unknown (owner can copy the same way)

Select the element in DevTools, open the Styles panel, and copy all declarations including the `@media` blocks:

1. An ordinary section, for example "Key Brands" or "What Value Mean To Us" (its padding top and bottom, and any extra horizontal padding).
2. The header or nav (height, padding, position, background).
3. The gap between cards and between columns, and the padding inside a project card.
4. The footer (padding, columns).
5. Any `@media` rules below 991px (for example at 767px) for the container, sections and grids.
6. The hero heading and body text sizes (optional, the owner decided to keep our current type values).

Until then these stay Assumed: vertical padding of non-hero sections, gaps, nav and footer metrics, and the mobile breakpoint below 991px.
