# Style Guide

> Voice, copy, imagery and naming rules, plus the spec for the internal style-guide page. Visual tokens live in `design-system.md` and its siblings. Last updated: 2026-11-18.

## 1. Voice and Copy

- Calm, confident, minimal. Short sentences. Say what was built and why it mattered.
- Headlines are statements, not slogans. Example pattern: "I craft interfaces for the modern web."
- Plain English. No buzzwords, no exclamation marks, no emoji.
- First person singular on the site ("I design and build...").
- Case is authored in content: sentence case for headings and body; the hero headline may be authored in capitals. Only labels are uppercased by CSS.
- Use typographic punctuation in content (’ “ ” —) and keep straight quotes in code.

## 2. Microcopy

| Element | Label |
|---|---|
| Primary contact action | Start a project |
| Secondary contact action | Let’s talk |
| View all projects | All work |
| Project card cursor | View |
| Copy email | Copy email, then Copied ✓ |
| Form submit | Send message, then Sending…, then Sent ✓ |
| Form failure | Something went wrong. Email me directly at {email}. |
| Empty filter | No projects in this category. Show all |
| 404 | This page doesn’t exist. Take me home |

## 3. Imagery

- Project images: real screenshots or mockups, exported at the sizes in `performance-budget.md`, with explicit width and height.
- Always placed on top of the project's colour shape and pixel shape. No shadow, border or rounded corners on the image.
- Alt text describes what the image shows and why it matters; decorative shapes have empty alt.
- Portraits: one consistent crop (4/5), neutral background.
- Photography treatment: duotone base with colour reveal (About only).

## 4. Iconography

- Pixel-style arrows (↗ →) for links; no other icon set unless added to the decision log.
- Icons are flat, single-colour, sized with the text.
- Icons never carry meaning alone; pair with text or an accessible name.

## 5. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files and folders | kebab-case | `project-card.astro` |
| Components | PascalCase | `ProjectCard` |
| Tokens | `--{category}-{role}-{variant}` | `--color-bg-alt` |
| Content slugs | kebab-case, stable | `project-one` |
| Interaction IDs | `I-nn` in docs; `data-motion="reveal"` style attributes in markup | |
| Branches and commits | Fixed in `code-standards.md` | |

## 6. Internal Style-Guide Page

- Route `/styleguide`; `noindex`; excluded from the sitemap and navigation; available in preview and development builds, not production.
- Shows every token group (colour primitives and semantics in both themes, text roles, spacing, radii, shapes, motion durations and easings), every component with all variants and states, and the interaction catalogue with live demos and their fallbacks.
- It is generated from the token source and component metadata so it cannot drift from the code.
- A change is not done until it appears correctly here.

## 7. Review Checklist (design)

- Passes the anti-generic checklist in `design-system.md`.
- Fonts follow the role table in `typography.md`; no h1 outside Jersey 20 and no h2 to h6 outside Stack Sans Notch.
- No shadows; no strokes except the listed exceptions.
- Text contrast meets AA in both themes.
- Layout matches `ui-layout.md` and `page-specs.md` at mobile, tablet and desktop widths.
- Motion matches `interaction-motion.md`, including fallbacks.
