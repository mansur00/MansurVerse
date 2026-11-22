# Performance Budget

> Budgets are release blockers (AGENTS.md rule 7). Numbers marked Assumed are starting values to be tuned from real measurements in Phase 7. Last updated: 2026-11-19.

## 1. Core Web Vitals (75th percentile targets)

| Metric | "Good" threshold | Our target |
|---|---|---|
| LCP | 2.5s | 2.0s on a mid-range phone on 4G |
| INP | 200ms | 150ms |
| CLS | 0.1 | 0.05 |

## 2. Lighthouse Targets (Assumed)

| Category | Desktop | Mobile |
|---|---|---|
| Performance | 95 | 90 (Home: 85 allowed because of the hero shader; log the exception) |
| Accessibility | 100 | 100 |
| Best Practices | 95 | 95 |
| SEO | 100 | 100 |

## 3. Resource Budgets, First Load (Assumed, compressed)

| Resource | Budget |
|---|---|
| HTML per page | 30KB |
| CSS total | 40KB |
| JavaScript before interaction | 90KB (framework-free scripts, GSAP core, Lenis) |
| WebGL chunk (OGL plus shader), lazy after first paint | 60KB |
| Fonts | At most three families, 150KB total WOFF2 (Latin subset) |
| Project image at displayed size | 120KB (AVIF or WebP) |
| Requests before interaction | 40 |

## 4. LCP, CLS and INP Rules

- **LCP element is text.** The hero `h1` must paint without waiting for JavaScript or WebGL. Preload Jersey 20 and Plus Jakarta Sans; use `font-display: swap` with metric-matched fallbacks.
- **No layout shift.** Explicit width and height or aspect ratio on all media; reserve space for fonts via fallback metrics; nothing injected above existing content; animate transform and opacity only.
- **Responsive input.** No task over 50ms. Pointer and scroll handlers are passive and run through the single ticker. Defer non-critical initialisation with idle callbacks.

## 5. Loading Strategy

- Hydrate with the narrowest directive (`client:idle`, `client:visible`, `client:media`); see `architecture.md`.
- Import only the GSAP plugins used; dynamic-import Flip (Work), Draggable (About, if used) and the WebGL module.
- Images: Astro image pipeline, AVIF and WebP, `srcset` and `sizes`, `loading="lazy"` and `decoding="async"` below the fold; no lazy loading for the one above-the-fold image if any.
- No third-party scripts, fonts or embeds.
- Caching: hashed assets immutable for one year; HTML revalidates; Brotli compression (details in `deployment.md`).

## 6. Low-Power and Mobile

The fallback matrix in `interaction-motion.md` applies: larger digit cells, device pixel ratio cap of 1.5, no tilt or parallax on low-power devices or `saveData`.

### 6.1 Digit Field Runtime Guard (I-05)
- **Frame budget**: Average frame render time over the initial probe period must remain $\le 16$ms.
- **Software rendering**: Detected via `WEBGL_debug_renderer_info` (`swiftshader`, `llvmpipe`, etc.); automatically starts at half-resolution (`dpr: 0.5`, cell size 40px) and 30fps cap.
- **Adaptive step-down**: If average frame time exceeds 16ms or a single frame exceeds 12ms, quality steps down to 30fps and 0.5 DPR.
- **Static poster fallback**: If average frame time exceeds 24ms, WebGL rendering is automatically halted and the pre-rendered static SVG poster is displayed with zero ongoing CPU/GPU overhead.

## 7. Measurement and Enforcement

- Lighthouse CI on every PR with assertions for the scores and metrics above (mobile and desktop profiles).
- A build-output size check fails CI when any budget in section 3 is exceeded.
- Chrome performance traces of Home scroll and Work filtering reviewed in Phase 7 (no long tasks).
- Real-user monitoring is out of scope by default (O-06).

## 8. Exceptions

A budget may be exceeded only with an owner-approved decision-log entry stating the cost, the benefit and the plan to recover it.
