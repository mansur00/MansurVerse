# UI Layout

> Layout patterns copied in spirit from ollyo.com. Offsets and breakpoints are **Assumed** from the prototype and screenshots until verified (O-01). Last updated: 2026-11-18.

## 1. Breakpoints and Grid

| Name | Range | Notes |
|---|---|---|
| Mobile | up to 720px | Single column; hover-only features need tap equivalents |
| Tablet | 721–1100px | Assumed; two-column patterns stay |
| Desktop | above 1100px | Full layouts |

The prototype switches layouts at 720px only; add the tablet range when verifying. Grid: 12 columns, gaps from `--layout-gap`. Sections are full-bleed backgrounds with horizontal padding `--layout-pad`; content is asymmetric rather than centred.

## 2. Placement Patterns

| Pattern | Description | Used by |
|---|---|---|
| Left-aligned heading | Heading hugs the left padding, label above | Section headings |
| Right-column intro | Short paragraph pushed to the right half under a heading | Hero intro |
| Indented statement | Large sentence starting about a quarter in | Statement |
| Label / description split | Label left (1fr), text right (2fr) | Values rows |
| Job row | Category (1fr), title and meta (3fr), pill (auto) | Open-to |
| Staggered tiles | Alternate tiles shifted down about 40px | Numbers |
| Offset art | Image and shapes bleed past the card edge | Project cards |

## 3. Section Anatomy

Slash label → heading → content. Heading and label share the left edge. Vertical rhythm uses `--layout-section-y`.

## 4. Component Layouts (desktop → mobile)

| Component | Desktop | Mobile |
|---|---|---|
| Project card | 2 columns (1fr / 1.15fr): text left, art right; stacked full width | Single column; art below text, 240px high |
| Process steps | 4 columns | 2 columns |
| Stat tiles | 4 columns, staggered | 2 columns |
| Capability rows | Full width stacked rows | Same; tap toggles |
| Values rows | 1fr / 2fr | Single column |
| Case study | Sticky meta 240px + content | Meta above content, not sticky |
| About | Portrait 1fr + text 1.2fr | Stacked |
| Footer | 3 columns | Single column |

## 5. Home Wireframe (desktop)

```
[Nav: logo ........ Home Work About Contact Theme]
HERO   "I craft interfaces for the"
       MODERN        <Code>
       WEB  <Design>        <Motion>
                         intro text (right)
       (0/1 digit field behind)
STATEMENT   (indented large sentence, words fill on scroll)
WORK   / Selected Work
       [ card 01  full width ]
       [ card 02  full width ]
       [ card 03  full width ]
       [ card 04  full width ]
CAPABILITIES (dark)  rows 01..06
PROCESS  4 steps
VALUES (dark)  heading + 3 tags + 3 rows
NUMBERS (dark, dots)  heading + 4 staggered tiles
MARQUEE
CONTACT CTA  Say hello / huge email / copy
FOOTER  pages | social | local time
```

## 6. Project Card Wireframe

```
+------------------------------------------------+
| 01                         ( colour half-pill )|
| Project Title             [ pixel ][ image    ]|
|                           [ shape ][ on top   ]|
| Short description                              |
| (Category) (Year)                              |
+------------------------------------------------+
```

## 7. Safe Areas and Fixed Elements

Honour `env(safe-area-inset-*)`. Sticky nav sits at `top: env(safe-area-inset-top)`. A cover bar of the base colour fills the status area. One-screen layouts use height 100% on html and body, not 100vh.

## 8. Responsive Rules

- Touch targets at least 44×44px.
- Every hover-only reveal has a tap or focus equivalent.
- Media uses explicit aspect ratios: portrait 4/5, project image placeholder 3/2 (to be set from real images), compare slider fluid height.
- No horizontal page scroll at any width; wide content scrolls inside its own container.
