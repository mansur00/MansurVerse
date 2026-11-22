# Animation Implementation

> How the interactions in `interaction-motion.md` are built. Behaviour and timing are defined there; this file defines mechanisms. Last updated: 2026-11-22.

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

## 3. Registry & Core (Implemented in Phase 5a)

Files in `src/scripts/motion/`: `ticker.ts`, `lenis.ts`, `registry.ts`, `context.ts`, `nav.ts`, `menu.ts`.

- **`context.ts`**: Reactive detection of `isReducedMotion()`, `isFinePointer()`, `isLowPower()` (detecting `saveData`, concurrency <= 4, deviceMemory <= 4). Dispatches `'mansurverse:motionchange'` upon toggle. Motion durations and easings imported directly from generated `tokens.ts`.
- **`ticker.ts`**: Central GSAP ticker driving Lenis via `gsap.ticker.add((time) => lenis.raf(time * 1000))`. `gsap.ticker.lagSmoothing(0)` disables lag smoothing so scroll and tweens stay locked. No competing `requestAnimationFrame` loops.
- **`lenis.ts`**: Lenis smooth scroll engine (`lerp: 0.1`, ~1.1s feel). Destroyed immediately under reduced motion (`isReducedMotion()`), paused while mobile menu is open, synchronised with `ScrollTrigger.update()`.
- **`registry.ts`**: Lifecycle coordinator. Holds registered modules, initializes on `astro:page-load`, tears down on `astro:before-swap`, manages scoped `gsap.matchMedia()` instances.
- **`nav.ts` (I-02)**: Nav hide/show on scroll direction past 120px down (`translateY(-110%)`, `--motion-base`), returns on scroll up, at page top, when focus is inside Nav, or when menu is open. Disabled under reduced motion.
- **`menu.ts` (I-03 behaviour)**: Mobile `MenuOverlay` controller. Traps keyboard Tab/Shift+Tab focus, closes with Escape key, restores focus to hamburger trigger, pauses Lenis, locks document scroll.
- **`theme-toggle.ts` (I-01)**: View Transitions circular reveal from button center (600ms, ease-out) where supported, 200ms colour fade fallback otherwise, instant under reduced motion.
- **`MotionToggle.astro` (I-37)**: Functional toggle button manipulating `data-motion="reduced"` on `<html>`, updating `aria-pressed`, persisting in `localStorage` in try/catch, and initializing from `prefers-reduced-motion`.
- **`BaseLayout.astro` (I-34)**: `<ClientRouter fallback="swap" />` with `transition:persist` on `Nav` and `Footer`. Moves focus to page `h1` (`tabindex="-1"`) and announces document title in polite live region (`#page-announcer`). Reserved `transition:name` hook on `ProjectCard` and case-study header.
- **`scripts/check-bundle-size.mjs`**: Automated build-output check verifying client JS remains under the 90KB compressed budget (57.2KB measured).

### Phase 5b Supporting Interactions Modules

Implemented in `src/scripts/motion/` and driven by `data-motion` attributes:
- **`reveal.ts` (I-08, I-09, I-16)**: Scroll reveal rises 28px and fades in once at 15% visibility (`--motion-slow`, `--ease-out`); child elements in `[data-motion-container="reveal"]` stagger by `--motion-stagger` (100ms). Line reveal splits headings via `SplitText` inside overflow-hidden line masks; accessible heading name preserved via `aria-label`, split lines hidden via `aria-hidden="true"`.
- **`scrub.ts` (I-10, I-30)**: ScrollTrigger scrub progressively shifts words from muted to primary colour as scroll progress enters the viewport. Under reduced motion, all words render filled immediately.
- **`counter.ts` (I-17)**: Stat numbers count up from 0 to target over `--motion-count` (1200ms) with `power2.out` easing when scrolled into view. DOM and `aria-label` retain exact final string value upon completion and under reduced motion.
- **`marquee.ts` (I-18)**: Infinite CSS loop at `--motion-marquee` (30s). Responsive to scroll velocity: playback speed scales up to 3x and eases back to 1x over 600ms via GSAP. Static (`animation: none`) under reduced motion.
- **`capability.ts` (I-15)**: Capability row details element smoothly animated using `grid-template-rows: 0fr` to `1fr` over `--motion-base` (400ms). On fine pointers, hovering opens the row and drives `#capability-floating-visual` follower chip.
- **`cursor.ts` (I-11, I-12)**: 14px lime dot follows fine pointers via `gsap.quickTo`. Over `[data-cursor]` targets, expands into an 84px pill displaying the cursor label. Disabled on touch (`@media (pointer: coarse)`). Magnetic buttons pull up to 10px within an 80px radius; inner label pulls 1.4x further; springs back over `--motion-base`.
- **`clipboard.ts` (I-20)**: Copies email address to clipboard with fallback `textarea` selection; updates label to "Copied ✓" for 1800ms; announces action to screen readers in `#page-announcer` live region.
- **`clock.ts` (I-21)**: Footer local time updates every 30s using `Intl.DateTimeFormat` with configured `site.timezone` (`timeZone: 'UTC'`).
- **`KeywordTag.astro` (I-06)**: CSS keyframe ambient float (`@keyframes tag-float`) rotating ±2.5° and translating -10px over `--motion-float` (3.6s) with alternate easing and staggered delays. Disabled under reduced motion.
- **`Nav.astro` (I-03)**: Desktop link letter-roll upward to duplicate glyph layer over `--motion-base` with 20ms character stagger. Accessible name preserved in `.sr-only`.
- **`ProjectCard.astro` (I-13)**: Card lifts 6px on hover and `:focus-visible` over `--motion-base`; image block shifts `(-8px, -8px)` over `--motion-slow`. Reduced-motion bypasses transform.

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
