# Animation Implementation

> How the interactions in `interaction-motion.md` are built. Behaviour and timing are defined there; this file defines mechanisms. Last updated: 2026-11-19.

## 1. Decisions

- **Router:** Astro `<ClientRouter />` (closes O-18). It provides shared-element transitions via `transition:name`, persistence via `transition:persist`, and a lifecycle: `astro:before-preparation`, `astro:after-preparation`, `astro:before-swap`, `astro:after-swap`, `astro:page-load`.
- **Engine:** GSAP (core, ScrollTrigger, Flip, SplitText, Draggable as needed), Lenis for scrolling, OGL for the hero shader.
- **Module scripts run once** on first load under the client router, so page-specific code must initialise from `astro:page-load` and clean up on `astro:before-swap`.

## 2. Lifecycle

| Event | Action |
|---|---|
| First load | Create the ticker, Lenis, cursor and theme listeners once |
| `astro:page-load` (initial and every navigation) | Scan the new document for `[data-motion]`, call each registered `init(root, ctx)`, then `ScrollTrigger.refresh()` |
| `astro:before-swap` | Call `cleanup()` for the outgoing page's registrations; revert its `gsap.matchMedia()` contexts |
| After fonts and images settle | `ScrollTrigger.refresh()` |

Persistent systems (ticker, Lenis, cursor, theme) are never torn down on navigation.

## 3. Registry

Files in `src/scripts/motion/`: `ticker.ts`, `lenis.ts`, `registry.ts`, `context.ts`, one file per interaction group.

```ts
register('reveal', {
  init(root, ctx) { /* attach; return nothing */ },
  cleanup() { /* remove listeners, observers, tweens */ },
});
```

`ctx` contains: `tokens` (durations, easings from generated TS), `reduced`, `finePointer`, `lowPower`, and the page's `gsap.matchMedia()` instance. Markup opts in with `data-motion="name"` plus data attributes for options (for example `data-motion-stagger`). No interaction code queries elements by class names that belong to styling.

## 4. Ticker and Lenis

GSAP's ticker drives Lenis; Lenis scroll events call `ScrollTrigger.update`; lag smoothing is disabled so scroll and tweens stay in step. Lenis is not created when reduced motion is on. It stops while the menu overlay is open. CSS `scroll-behavior: smooth` is never set (D-32).

## 5. Media Conditions

`gsap.matchMedia()` branches on: `(prefers-reduced-motion: reduce)`, `(pointer: fine)`, `(max-width: 720px)`. A `lowPower` helper reads `saveData`, `hardwareConcurrency` and `deviceMemory`. Each registration declares which branch it supports; the fallback matrix in `interaction-motion.md` is the source of truth.

## 6. Interaction Mapping

| ID | Mechanism |
|---|---|
| I-01 | View Transitions API on the theme attribute change with a circular `clip-path` animation; fallback colour transition |
| I-02 | ScrollTrigger or Lenis scroll direction; toggles a class that applies a CSS transform |
| I-03 | CSS letter-roll with duplicated glyph layers; `gsap.quickTo` for the magnetic pull; overlay entrance as a timeline |
| I-04 | Timeline run once per session (flag in `sessionStorage`, in try/catch) |
| I-05 | OGL renderer, see section 7 |
| I-06 | CSS keyframes for float; `gsap.quickTo` for cursor shift |
| I-08 | `ScrollTrigger.batch` adds a class once; CSS handles the transition |
| I-09 | SplitText by lines with mask wrappers; keep the accessible name on the heading |
| I-10, I-30 | ScrollTrigger with `scrub` over word spans; inline shapes toggled by progress |
| I-11 | One pointer listener feeding `quickTo` on a fixed element; label from `data-cursor` |
| I-12 | `quickTo` on position and label offset inside a radius |
| I-13 | CSS transitions; focus-visible mirrors hover |
| I-14 | Router shared-element transition via `transition:name`; custom animation for the art block |
| I-15 | CSS grid-row transition; `quickTo` follower |
| I-16 | Batch reveal (v1); pinned ScrollTrigger timeline (v2) |
| I-17 | Tween an object's value; write rounded text; final value in the DOM and `aria-label` |
| I-18 | CSS animation or a timeline whose `timeScale` follows scroll velocity |
| I-19, I-35 | One `quickTo` per letter; positions measured once and on resize, not per event |
| I-20 | Async clipboard call in try/catch; live region update |
| I-21 | Sticky footer technique for the reveal; `Intl.DateTimeFormat` with the configured time zone |
| I-22, I-23 | `Flip.getState` before the change, `Flip.from` after |
| I-24 | `quickTo` on rotation inside perspective |
| I-25 | ScrollTrigger per heading toggling the active anchor |
| I-26 | Range input updates a CSS variable used by `clip-path` |
| I-27 | ScrollTrigger scrub on transforms; timeline for the device screenshot |
| I-28 | ScrollTrigger progress at the page end; `navigate()` at 100% |
| I-29 | `quickTo` on two CSS variables used by the mask |
| I-31 | Static by default; Draggable (plus physics decision, O-07) optional |
| I-33 | Small state machine: idle, sending, sent, failed; classes drive visuals |
| I-34 | Router transition plus per-page reveals |

## 7. Digit Field (I-05)

- OGL renderer on a canvas behind the hero, `aria-hidden`.
- A glyph atlas texture of `0` and `1` is drawn once in an offscreen canvas using the label font.
- A fragment shader computes the cell grid (cell size from tokens), picks the digit by a hash of the cell, and applies the opacity falloff from the pointer position; digits within the flip radius alternate on the flip interval.
- Uniforms: resolution, pointer, time, cell size, flip radius, colour token value.
- Device pixel ratio capped at 1.5 (lower on low power); resize observer; renders only while visible (IntersectionObserver) and while the tab is visible.
- Context loss or init failure adds a `no-webgl` class and the static fallback shows: a pre-rendered pattern generated at build and used as the canvas poster.
- Reduced motion renders one frame and stops.

## 8. Accessibility

Split or animated text keeps its full string for assistive technology (accessible name on the container, split spans hidden from the accessibility tree). Nothing animates focus order. Animations never remove content that a user needs under reduced motion.

## 9. Testing

Playwright runs with reduced motion on and off, touch emulation and JavaScript disabled; asserts content is visible in every mode, navigation works with transitions disabled, and no console errors appear. A performance trace on Home checks for tasks over 50ms during scroll. Unit tests cover helpers (lowPower, tokens, registry lifecycle).

## 10. Done When

Each interaction passes the checklist in `interaction-motion.md` section 6; cleanup leaves no listeners or tweens after navigation; no raw durations or easings appear in the code.
