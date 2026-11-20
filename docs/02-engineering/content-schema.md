# Content Schema

> Every piece of text, data and media on the site, where it lives and how it is validated. Components never hold copy, links or image paths (AGENTS.md rule 1). Schemas are Zod schemas in `src/content.config.ts` and `src/config/`; the build fails on invalid content. Last updated: 2026-11-19.

## 1. Where Content Lives

| Source | File | Type |
|---|---|---|
| Site config | `src/config/site.ts` | Typed object |
| Home page copy | `src/content/home.json` | Single entry |
| Profile | `src/content/profile.json` | Single entry |
| Projects | `src/content/projects/*.mdx` | Collection (frontmatter plus MDX body) |
| Capabilities, process, values, stats, experience, skills, open-to | `src/content/<name>.json` | Single entry each |

## 2. Shared Rules

- English only. Typographic punctuation (’ “ ”) in strings; no HTML in strings.
- Images go through the Astro image pipeline; every image has `alt` (empty string only for decorative images, with `decorative: true`).
- URLs are `https://` or site-relative; `mailto:` only for the email field.
- Accent fields are enums of token names, never colour values.
- Every entry may carry `placeholder: true`. Production builds warn for each placeholder; the launch checklist requires zero.
- Length limits below are enforced by the schema so layouts cannot break.

## 3. Site Config (`site.ts`)

| Field | Type | Notes |
|---|---|---|
| `brand.primary`, `brand.secondary` | string | Wordmark parts: "Mansur" (Jersey 20) and "Verse" (Stack Sans Notch) |
| `url` | URL | Canonical origin |
| `nav` | array of `{label, href}` | 3 to 6 items |
| `seo` | `{titleTemplate, description, ogImage}` | `description` at most 160 chars |
| `footer` | `{pagesLabel, elsewhereLabel, timeLabel, copyright}` | |
| `timezone` | IANA string | Footer clock (O-16) |
| `cta` | `{label, heading, text, button:{label, href}}` | CTA band |
| `notFound` | `{heading, text, button:{label, href}}` | 404 |
| `form` | `{labels, placeholders, errors, sending, sent, failed, privacyNote}` | All form microcopy |
| `categories` | array of strings | Allowed project categories (filter chips come from the ones in use) |

## 4. Home (`home.json`)

| Field | Type | Limits |
|---|---|---|
| `hero.lead` | string | at most 60 chars |
| `hero.headline` | array of 1 to 3 strings | Lines of the `h1`; each at most 14 chars |
| `hero.tags` | array of 3 `{label, accent}` | `label` at most 12 chars |
| `hero.intro` | string | at most 200 chars |
| `statement.text` | string | at most 220 chars |
| `statement.inline` | array of `{afterWord:int, kind:'shape'|'image', shape?, image?}` | At most 3 |
| `statement.link` | `{label, href}` | |
| `work` | `{label, heading, ctaLabel}` | |
| `numbers` | `{label, heading[], lead}` | |
| `values` | `{label, heading[], tags[3]}` | |
| `contactCta` | `{label, heading}` | |

## 5. Profile (`profile.json`)

`name`, `role`, `bio` (array of paragraphs, each at most 400 chars), `portrait {image, alt}`, `email`, `availability {status:'open'|'busy', label}`, `socials` (array of `{label, url}`), `cvUrl` (optional).

## 6. Projects (`projects/*.mdx`)

Frontmatter:

| Field | Type | Rules |
|---|---|---|
| `title` | string | at most 48 chars |
| `order` | int | Unique; lower comes first |
| `featured` | boolean | Home shows the first four featured by `order` |
| `category` | string | Must be in `site.categories` |
| `year` | int | |
| `role` | string | |
| `tools` | string array | |
| `links` | array of `{label, url}` | optional |
| `summary` | string | at most 140 chars (card description) |
| `accent` | enum | `primary`, `secondary-1` to `secondary-4`, `blue` (colour of the half-pill block and pixel shape) |
| `cover` | `{image, alt}` | Card art and case-study header; required |
| `gallery` | array of `{image, alt, caption?}` | optional |
| `device` | `{screens: image[]}` | optional; for mockup scroll (I-27) |
| `compare` | `{before:{image,alt}, after:{image,alt}}` | optional; both images equal dimensions |
| `results` | array of `{value:int, suffix, label}` | optional; 2 to 4; falls back to global stats |

Body (MDX): must contain these `##` headings in order: Overview, Problem, Solution, Results (a build check enforces it). The sidebar and scroll-spy are generated from the headings. Slug equals the filename and never changes after publishing.

Example frontmatter:

```yaml
title: Project One
order: 1
featured: true
category: Web
year: 2026
role: Design and frontend
tools: [Astro, GSAP, Figma]
summary: One sentence about the problem and the outcome.
accent: primary
cover: { image: ./cover.jpg, alt: "Homepage of Project One on a laptop" }
placeholder: true
```

## 7. Other Collections

| File | Shape | Limits |
|---|---|---|
| `capabilities.json` | `{label, items:[{title, description}]}` | 4 to 8 items; title at most 32 chars; description at most 140 |
| `process.json` | `{label, items:[{title, text}]}` | Exactly 4; text at most 100 |
| `values.json` | `{items:[{label, text}]}` | Exactly 3; label at most 40; text at most 140 |
| `stats.json` | `{items:[{value:int, suffix, label, tone:'lime'|'white'}]}` | 2 to 4 |
| `experience.json` | `{items:[{period, role, place}]}` | |
| `skills.json` | `{items:[string]}` | |
| `open-to.json` | `{label, items:[{category, title, meta}]}` | 1 to 4 |

## 8. Validation (build time)

Schema errors fail the build. Additional checks: unique `order` and slugs; every project has the four headings; `compare` images match in size; every `category` is allowed; at least one project exists; alt text present; placeholder warnings in production.

## 9. Adding a Project

Create one MDX file and its images; run `verify`. No component or config change is needed.
