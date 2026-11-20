# Project Brief

> Source of truth for scope. Anything not listed here is out of scope until this file is updated and the change is recorded in `decision-log.md`. Last updated: 2026-11-18.

## 1. Overview

A UI-design-focused personal portfolio for a frontend designer + developer. It must be modern, fancy and highly interactive, with typography and layout that are unmistakably designed rather than templated.

Reference: ollyo.com. We copy its layout style, typography roles, flat colour-block look, "/" label motif, numbered lists and pixel-stepped shapes. We do not copy its copy, logos or images.

Visual reference for this brief: the approved prototype (https://claude.ai/artifact/93aQ1n1oAjXdLc9L8YuRaK). It uses canvas instead of real WebGL, no GSAP or Lenis, and placeholder images. Treat it as the look and the interaction intent, not as code.

Brand name: MansurVerse. The wordmark sets "Mansur" in Jersey 20 and "Verse" in Stack Sans Notch.

## 2. Goals

- Show UI design and frontend engineering craft through the site itself.
- Present selected projects as clear case studies.
- Make contact easy.
- Stay fast and accessible despite heavy interaction.
- Be fully driven by tokens, content files and config so an agent can maintain it without touching component code for content or styling changes.

## 3. Audience (assumed)

Hiring managers, design and engineering leads, and clients looking for UI design and frontend work.

## 4. Design Direction (non-negotiable)

- **Not generic.** Layout style and fonts follow ollyo.com.
- **Fonts.** Jersey 20 for `h1` only. Stack Sans Notch for `h2` to `h6`, small uppercase labels and stat numbers. Plus Jakarta Sans for body and long statements. Type is large and confident.
- **Flat.** No shadows, no strokes on filled elements. Filled elements have no outline; outlined elements have no fill. A hairline divider token is the only line.
- **Shapes.** Sharp-cornered cards and tiles; fully rounded chips, buttons and pills; pixel-stepped decorative shapes.
- **Colour.** Lime is the signature accent, supported by blue, pink and cyan, on a light grey / charcoal base. Sections alternate backgrounds (light, mid grey, charcoal). Exact values are defined in `color-tokens.md` after verification against ollyo's CSS.
- **Motifs.** "/" before labels, superscript numbers (`01`, `02`), keyword tags sitting on headings, inline shapes in statements.
- **Theme.** Dark and light with a toggle; follows system preference first; choice persists.

## 5. Scope: Pages

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Impression, selected work, capabilities, process, values, numbers, contact CTA |
| Work | `/work` | Full project index |
| Case study | `/work/[slug]` | One template reused for every project |
| About | `/about` | Story, skills, experience, availability |
| Contact | `/contact` | Get in touch |
| 404 | `/404` | Branded not-found page |

Out of scope for v1: Lab (UI experiments), Notes (blog), i18n, CMS, user accounts.

## 6. Page Contents and Interactions

Full per-section specs (states, timings, fallbacks) live in `docs/01-design/page-specs.md`. This is the agreed outline.

### 6.1 Home (in order)

1. **Nav.** Sticky; hides on scroll down and returns on scroll up. Theme toggle. Magnetic links. Full-screen menu on mobile with letter-roll hover.
2. **Hero.** Large `h1` headline. A minimal field of small, slightly blurred `0` and `1` digits fills the background (WebGL, with a canvas/static fallback); digits near the cursor brighten and flip. Three highlighted keywords (Code, Motion, Design) sit on the heading as coloured tags that float gently and shift slightly with the cursor. Short intro text to the right. Intro animation on load.
3. **Statement.** One large sentence; words fill with colour as you scroll. Planned: inline shape and image blocks inside the sentence and an "About me" link with a pixel arrow.
4. **Selected work.** Vertical list of four full-width project cards. Each card has a white background, number, title, short description and chips on the left; on the right a flat colour shape, a pixel-stepped shape and the project image on top. Cursor becomes a "View" label on hover; click opens the case study with a shared-element transition.
5. **Core capabilities.** Charcoal section; numbered rows with "/" labels. Hover or focus expands the description; a floating visual follows the cursor. Alternative layout (flowing inline list with "/" and superscripts) is under consideration.
6. **Process.** Four numbered steps that reveal in sequence; later upgraded to a pinned scroll stage with an SVG path that draws as you scroll.
7. **Values.** Charcoal section; large heading with three animated keyword tags; three rows (label left, description right); flat colour blocks at the edge.
8. **Numbers.** Charcoal section with a dot texture and no gradient; four staggered stat tiles (lime and white) with counting numbers. A photo backdrop (as on ollyo) is possible once real images exist.
9. **Marquee.** Capability names with "/" separators and superscript numbers; speed responds to scroll velocity.
10. **Contact CTA.** "Say hello" heading, a very large email address whose letters move away from the cursor, and a copy button.
11. **Footer.** Page links, social links, live local time, copyright. Footer reveal effect planned.

### 6.2 Work

Title with live project count; filter chips that re-flow the grid with an animated layout transition; grid and list toggle (list shows a cursor-following preview); the same project cards as Home; 3D tilt and staggered entrance. Extra sections: Capabilities, Process, CTA.

### 6.3 Case study

Header (title, role, year, tags). Sticky meta sidebar (role, year, tools, links) with scroll-spy. Sections: overview, problem, solution, results. Before/after compare slider, image parallax, device mockup with inner scroll. Pull-to-next-project at the bottom. The cover expands from the card that was clicked. Extra sections: Numbers (results), Process, More work, CTA.

### 6.4 About

Portrait with a cursor spotlight revealing colour over a duotone base. Bio with scroll-scrub reveal. Skill chips (draggable with physics is optional). Experience timeline. Extra sections: Values, Numbers, Open to (careers-style rows with a "Let's talk" pill), CTA.

### 6.5 Contact

Form with floating labels and animated per-field validation; the submit button morphs from loading to success. Copy-email button, availability dot, live local time, magnetic social links. Extra sections: Process, Open to.

### 6.6 404

Short branded message and a "Take me home" pill; cursor-reactive distortion planned.

## 7. Global Features

- Responsive from small phones to large desktops.
- Smooth scrolling; page transitions.
- Scroll reveals and line-by-line text reveals.
- Custom cursor and magnetic buttons (fine pointers only).
- Light and dark themes with toggle and no flash on load.
- SEO metadata, Open Graph images, sitemap.
- `prefers-reduced-motion` support everywhere; no-WebGL fallback; keyboard and screen-reader support.

## 8. Interaction Tiers

- **Signature** (full effort, tuned for performance): hero digit field, project cards and transitions, contact letter repel.
- **Supporting** (lighter, CSS-first where possible): reveals, counters, tags, accordions, marquee.

On touch devices and low-power hardware, signature effects degrade to their static or reduced forms (rules in `interaction-motion.md`).

## 9. Content Model (summary)

All copy and data live in the repo as MDX/JSON and are validated by schemas. Nothing is hardcoded in components.

- `profile`: name, role, bio, portrait, socials, email, CV link, availability.
- `projects`: title, slug, role, year, tags/category, summary, chips, accent colour token, cover and gallery images, sections, featured flag, order.
- `capabilities`, `process`, `values`, `stats`, `experience`, `skills`, `open-to`.
- `site config`: navigation, SEO defaults, footer, theme defaults, social links.

Schemas are defined in `content-schema.md`.

## 10. Technical Baseline

Astro, TypeScript, Tailwind CSS 4, GSAP (with ScrollTrigger and Flip), Lenis, WebGL for the hero (Three.js or OGL, undecided). Details and versions in `tech-stack.md`. Hosting is undecided (Cloudflare or Vercel); see `deployment.md`.

## 11. Constraints

- English only.
- No hardcoded design or content values.
- Agents follow `AGENTS.md`; every deviation is logged in `decision-log.md`.
- Performance and accessibility budgets are release blockers.

## 12. Open Items

Tracked in `decision-log.md`. Most important: verify ollyo's exact tokens (colours, type scale, spacing) from its CSS; choose hosting, form provider and analytics; choose the WebGL library; owner to supply real content and images.

## 13. Success Criteria

- All pages and sections in section 6 are live and match the design docs.
- Performance and accessibility meet the budgets in the quality docs.
- Zero hardcoded design or content values (enforced by lint and review).
- Fully usable with reduced motion, without WebGL, and on touch devices.
- A new project can be added by creating a content file only.
