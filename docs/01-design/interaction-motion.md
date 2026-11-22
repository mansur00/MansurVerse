# Interaction and Motion

> Every interaction on the site, with trigger, behaviour, timing, tier and fallbacks. Page specs refer to interactions by ID. Timings are **Assumed** from the prototype unless marked. Last updated: 2026-11-18.

## 1. Motion Tokens

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 250ms | Hovers, colour changes, label swaps |
| `--motion-base` | 400ms | Menus, accordions, small transitions |
| `--motion-slow` | 800ms | Reveals, entrances |
| `--motion-count` | 1200ms | Counters |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | Default easing |
| `--ease-in-out` | `cubic-bezier(.6,0,.2,1)` | Ambient loops, symmetrical moves |
| `--motion-stagger` | 100ms | Gap between staggered items |
| `--motion-float` | 3.6s | Keyword tag float cycle |
| `--motion-marquee` | 30s | Marquee base loop |
| `--motion-digit-flip` | 160ms | Digit field flip interval |

## 2. Policy

1. Animate `transform`, `opacity`, `clip-path` and colour only. No animating layout properties, except the accordion grid-row technique.
2. One global ticker drives GSAP and Lenis. No competing `requestAnimationFrame` loops.
3. Ambient animation pauses when offscreen (IntersectionObserver) or when the tab is hidden.
4. `will-change` only while an element is animating.
5. Content is visible and usable without JavaScript. Reveal states are gated behind a `js` class.
6. Interactions never block reading, scrolling, focus or input.
7. Target 60fps on mid-range hardware; no task longer than 50ms in a scroll interaction.

## 3. Tiers

- **Signature:** I-05 digit field, I-13 and I-14 project cards and their transition, I-19 letter repel, I-34 route transitions. Full effort, tuned for performance.
- **Supporting:** everything else. CSS-first where possible.

## 4. Fallback Matrix

| Condition | Behaviour |
|---|---|
| `prefers-reduced-motion` | All reveals, parallax, scrubs, tilt, floating, flipping and marquee are off; content shows in its final state; colour changes remain instant; Lenis disabled |
| Coarse pointer (touch) | No custom cursor, magnetic, tilt, letter repel or hover previews; digit field renders a single static frame without continuous ticker loop; hover reveals become tap toggles; spotlight becomes static colour |
| No JavaScript | All content visible; accordions open; no animation |
| No WebGL or canvas | Digit field drawn once as a static pattern |
| Low power (`saveData`, 4 cores or fewer, 4GB memory or less) | Signature effects downgrade: larger digit cells and device pixel ratio capped at 1.5, no tilt, no parallax |
| No View Transitions API | Cross-fade 300ms instead of shared-element and circle-reveal transitions |

## 5. Catalogue

### Global

| ID | Name | Trigger and behaviour | Tier |
|---|---|---|---|
| I-01 | Theme toggle | Click flips the theme. Where View Transitions exist, the new theme reveals as a circle growing from the button (600ms, ease-out); otherwise a 200ms colour fade. Choice persists; an inline script sets the theme before first paint (no flash) | Supporting |
| I-02 | Nav hide and show | Hides (`translateY(-110%)`, `--motion-base`) when scrolling down past 120px; returns on scroll up, at page top, when focus is inside the nav, and when the menu is open | Supporting |
| I-03 | Nav hover and menu | Letters roll upward to a duplicate on hover (stagger 20ms, `--motion-base`). Links pull up to 8px toward the pointer. Mobile: full-screen overlay, links in `heading-row` size entering with an 80ms stagger; Esc closes; focus is trapped | Supporting |
| I-07 | Smooth scroll | Lenis, lerp-based, about 1.1s feel; anchors and focus work normally; stops while the menu is open | Supporting |
| I-08 | Scroll reveal | Elements rise 28px and fade in over `--motion-slow` with `--ease-out`, once, at 15% visibility; siblings stagger by `--motion-stagger` | Supporting |
| I-09 | Line reveal | Headings split into lines inside masks; lines slide up 100% to 0 over 900ms with a 120ms stagger, once. The original text stays in the accessible name | Supporting |
| I-11 | Custom cursor | A 14px lime dot follows the pointer. Over `[data-cursor]` it grows to an 84px pill (text-primary fill, base-colour label) over `--motion-fast`. The system cursor stays visible. Fine pointers only | Supporting |
| I-12 | Magnetic buttons | Within 80px of a button it pulls up to 10px; the label moves 1.4 times as far; springs back over `--motion-base` | Supporting |
| I-20 | Copy to clipboard | Click copies; label becomes "Copied ✓" for 1800ms then resets. If the clipboard API fails, the address is shown as text. Announced via `aria-live="polite"` | Supporting |
| I-21 | Footer | Optional reveal: footer sits beneath the content and the page slides up to uncover it, respecting safe areas. Local time updates every 30s using the time zone from site config | Supporting |
| I-34 | Route transition | Leaving content fades and shifts over 300ms; the incoming page runs its reveals. Nav, cursor and theme persist; scripts re-initialise. Router mechanism is decided in `animation-implementation.md` | Signature |
| I-36 | Preloader | Optional (O-08). Counter 0 to 100 in the display font with a lime bar; minimum 600ms; first visit per session only; skipped for reduced motion | Supporting |
| I-37 | Motion toggle | A footer button pauses all non-essential motion by setting `data-motion="reduced"` on `<html>`; the choice persists; the initial state follows the OS preference. Required for WCAG 2.2.2 | Supporting |

### Home

| ID | Name | Behaviour | Tier |
|---|---|---|---|
| I-04 | Hero intro | On first load per session: heading lines rise from masks (900ms, 120ms stagger), tags scale in, digit field fades in over 600ms | Supporting |
| I-05 | Digit field | A quiet background grid of `0` and `1` digits (cell `--digit-field-cell-size`: 28px standard, 40px low power; 14px Stack Sans Notch 600, fixed pseudo-random pattern) behind the hero canvas at `--opacity-digit-field` (0.45). Softness is achieved via bilinear texture atlas filtering without CSS blur filter. All shader calculations, cell centers, and distances are computed strictly in CSS pixels. Effective alpha far from pointer is 0.04 to 0.10 (`--digit-field-min-alpha`: 0.054). Within `--digit-field-falloff-radius` (240px) falloff rises smoothly up to peak 0.45 (`--digit-field-peak-opacity`); within `--digit-field-flip-radius` (110px), digits alternate every `--motion-digit-flip` (160ms). Uses opaque theme text colour (`--color-digit-field`: black light, grey-100 dark) with premultiplied alpha. Coarse pointers render a single static frame without an ongoing ticker loop. On fine pointers, the render loop pauses during page scrolling and resumes 150ms after scroll stops. Live theme and motion toggles update canvas state immediately without reload. Pointer handler stores position for ticker read (no layout thrashing); adaptive 30fps throttle on slow frames; runtime frame guard steps down quality or falls back to static SVG poster on slow/software rendering. Pauses offscreen. Static SVG poster fallback | Signature |
| I-06 | Keyword tags | Tags float: rotate ±2.5° and rise 10px over `--motion-float` with alternate easing, with staggered negative delays. They shift slightly with the cursor (offsets 16, -12 and 10px) and scale to 1.15 on hover. Also used on the Values heading | Supporting |
| I-10 | Statement scrub | Each word changes from muted to primary colour as scroll progress passes it. Inline shapes pop in (scale .6 to 1, 400ms) when the preceding word fills. Reduced motion: all filled | Supporting |
| I-13 | Project card hover | Card lifts 6px (500ms); the image block shifts (-8px, -8px) over 600ms; cursor label "View". Keyboard focus triggers the same state | Signature |
| I-14 | Card to case study | Shared-element transition: the card's art animates to the case study header (700ms). Direct visits skip it | Signature |
| I-15 | Capability row | Hover, focus or tap expands the description (grid rows 0fr to 1fr, `--motion-base`) and turns the title lime. On desktop a floating visual follows the cursor (lerp .15) | Supporting |
| I-16 | Process | v1: steps reveal in sequence (I-08). v2 (O-14): pinned stage with a path drawn on scroll; needs an exception in `spacing-radius-shadow.md` | Supporting |
| I-17 | Counters | Numbers count from 0 to target over `--motion-count` with ease-out when the tile enters, once. Tabular figures. The final value is in the DOM text and the accessible name | Supporting |
| I-18 | Marquee | Loops at `--motion-marquee`; speed multiplies by up to 3 with scroll velocity and eases back. Decorative (`aria-hidden`). Reduced motion: static | Supporting |
| I-19 | Letter repel | Each letter of the email moves away from the pointer inside a 140px radius, up to 28px, `--motion-fast` ease-out. Runs only while the CTA is in view. The email is a real `mailto:` link | Signature |

### Work

| ID | Name | Behaviour | Tier |
|---|---|---|---|
| I-22 | Filter | Chip click: non-matching cards scale and fade out; the rest re-flow with a Flip transition (600ms, ease-out). The count updates via `aria-live`. Empty state shows a message and a reset chip | Supporting |
| I-23 | View toggle | Grid and list switch with a Flip transition (500ms). In list view, hovering a row shows a preview image following the cursor (lerp .15). Touch: rows simply open | Supporting |
| I-24 | Card tilt | Cards tilt up to ±4° toward the pointer (perspective 1000px, `--motion-base`). Desktop only | Supporting |

### Case study

| ID | Name | Behaviour | Tier |
|---|---|---|---|
| I-25 | Scroll-spy | The sticky sidebar lists section anchors; the section crossing 40% of the viewport is highlighted. Clicking scrolls via Lenis | Supporting |
| I-26 | Compare slider | A range input drives the clip of the "After" layer; keyboard arrows step 1 (Shift 10); touch drag; 3px handle line | Supporting |
| I-27 | Parallax and device scroll | Images drift ±8% on scroll (transform only). Inside a device mockup the screenshot scrolls over about 6s when in view | Supporting |
| I-28 | Pull to next | Near the page end a "Next project" panel grows with scroll progress and navigates at 100% using I-14. Fallback: a normal link button | Signature |

### About, Contact, 404

| ID | Name | Behaviour | Tier |
|---|---|---|---|
| I-29 | Portrait spotlight | Duotone base; a masked colour layer (130px radius) follows the pointer with lerp. Touch: static colour | Supporting |
| I-30 | Bio scrub | Same mechanism as I-10 on the bio paragraph | Supporting |
| I-31 | Skill chips | Default: static chips that lift 4px on hover. Optional (O-07): draggable with physics | Supporting |
| I-32 | Experience rows | Hovering a row dims the others to 60% over `--motion-fast`; no layout shift | Supporting |
| I-33 | Form | Labels float on focus or when filled (`--motion-fast`). Validation runs on blur with an inline message (`aria-describedby`). Submit: label "Sending…" (disabled) then "Sent ✓" on cyan for 2200ms then reset. Failure: message with a `mailto:` fallback, `role="alert"` | Supporting |
| I-35 | 404 distortion | The heading letters displace with the pointer using the I-19 system | Supporting |

## 6. Per-Interaction Checklist

Each interaction is done only when: it matches this entry; it works with keyboard and screen reader; reduced motion, touch, no-JS and no-WebGL rows of the fallback matrix hold; no long tasks over 50ms appear in a performance recording; it uses tokens for durations and easings.
