# Spacing, Radius, Lines and Elevation

> The flat-look rules live here. Elevation does not exist in this design. Last updated: 2026-11-18.

## 1. Spacing

Base unit 4px.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |
| `--space-9` | 96px |
| `--space-10` | 128px |

Layout tokens (verified from ollyo.com DevTools, see `ollyo-layout-reference.md`):

| Token | Value | Use | Source |
|---|---|---|---|
| `--layout-container-max` | 1539px | Max container width (> 991px) | Verified (ollyo.com) |
| `--layout-container-max-narrow` | 800px | Max container width ($\le$ 991px) | Verified (ollyo.com) |
| `--layout-pad` | 20px | Horizontal container padding | Verified (ollyo.com) |
| `--layout-hero-top` | 200px | Hero distance from top of page | Verified (ollyo.com) |
| `--layout-hero-top-narrow` | 142px | Hero distance from top of page ($\le$ 991px) | Verified (ollyo.com) |
| `--layout-hero-bottom` | 120px | Hero bottom padding | Verified (ollyo.com) |
| `--layout-section-y` | `clamp(56px, 9vw, 120px)` | Section vertical padding | Assumed |
| `--layout-section-y-compact` | `clamp(24px, 4vw, 48px)` | Compact vertical padding | Assumed |
| `--layout-gap` | 16px | Card and tile gaps | Assumed |
| `--layout-gap-wide` | 24px | Column gaps | Assumed |

## 2. Radius

| Token | Value | Use |
|---|---|---|
| `--radius-none` | 0 | Cards, tiles, inputs, tags, images |
| `--radius-pill` | 999px | Chips, buttons, pills |
| `--radius-circle` | 50% | Cursor, availability dot |

Decorative half-pill (`999px 0 0 999px`) is allowed only as the large colour block behind project images. No other radii.

## 3. Elevation

**None.** `box-shadow`, `text-shadow` and `filter: drop-shadow` are forbidden. Hierarchy comes from colour blocks, overlap, offset (staggered tiles) and motion. Overlap is allowed (tags over headings, image over shape) but never with a shadow. `filter: blur` is allowed only for the hero digit field. ollyo's root CSS contains `--wp--preset--shadow--*` variables (natural, deep, sharp, outlined, crisp); these are WordPress core defaults, not evidence that the site uses shadows, and our rule is unchanged.

## 4. Lines and Strokes

Rules:
- A filled element has no border or stroke.
- An outlined element has a transparent fill.

Allowed exceptions, exhaustive:

| Exception | Spec |
|---|---|
| Hairline divider | 1px, `--color-divider` (or `-on-feature`); list rows, job rows, footer separator |
| Outlined chip or button | Transparent fill, 1px `--chip-outline-stroke` |
| Focus ring | 3px outline, offset 3px, `--color-focus` |
| Compare-slider handle | 3px line, text-primary colour |

Any other line needs a decision-log entry. Lint should flag `border` and `outline` outside these tokens.

## 5. Opacity

| Token | Value | Use |
|---|---|---|
| `--opacity-shape` | 0.5 | Pixel shape behind images |
| `--opacity-digit-field` | 0.4 | Hero digit canvas |

## 6. Z-Index

| Token | Value | Layer |
|---|---|---|
| `--z-content` | 1 | Content above background layers |
| `--z-tag` | 2 | Keyword tags |
| `--z-nav` | 20 | Sticky nav |
| `--z-safe-area` | 30 | Cover bar behind the status area |
| `--z-cursor` | 50 | Custom cursor |
