# Page Specs

> Every page and section: purpose, content source, layout reference, interactions, states, fallbacks. Interactions are IDs from `interaction-motion.md`; components are from `component-specs.md`; content keys are defined in `content-schema.md` (Batch 5). Last updated: 2026-11-18.

## 0. Global (all pages)

Nav (I-01, I-02, I-03), cursor (I-11), smooth scroll (I-07), route transitions (I-34), reveals (I-08, I-09), footer (I-21). Reduced motion, coarse pointer and no-JS behaviour follow the fallback matrix.

## 1. Shared Blocks

| Block | Content source | Where used | Variation per page |
|---|---|---|---|
| Capabilities | `capabilities` | Home, Work | None |
| Process | `process` | Home, Work, Case, Contact | None |
| Values | `values` | Home, About | None |
| Numbers | `stats` (global) | Home, About; Case uses the project's `results` stats, falling back to global | Heading and lead text from page config |
| Open to | `open-to` | About, Contact | None |
| CTA band | `site.cta` | Work, Case, About | None |

Blocks are one component each, parameterised by content; never copied markup.

## 2. Home

| ID | Section | Content | Layout and components | Interactions | States and notes |
|---|---|---|---|---|---|
| H1 | Nav | `site.nav`, wordmark | Nav, Logo, ThemeToggle, MenuOverlay | I-01 to I-03, I-12 | Mobile overlay; focus trap |
| H2 | Hero | `home.hero`: lead line, headline words, three tags (Code, Motion, Design), intro | Hero heading (`display-hero`), KeywordTag x3, intro text right | I-04, I-06, I-09 | Heading wraps at any width; tags never cover the first letters of a word at mobile (tag positions are percentages from content). Clean background; WebGL digit field deferred/removed (tag `digit-field-v1`) |
| H3 | Statement | `home.statement`: sentence, inline blocks (position index, kind), link to About | StatementText, inline PixelShape or image, link with pixel arrow | I-10 | Reduced motion: fully filled. Max 22ch |
| H4 | Selected work | `projects` where `featured`, ordered, first four | SectionHeader, ProjectCard x4 stacked full width, "All work" pill | I-08, I-13, I-14 | Fewer than four featured: show what exists; none: hide the section |
| H5 | Capabilities | `capabilities` | Feature surface, SlashLabel, CapabilityRow x n | I-15 | No JS: all rows open |
| H6 | Process | `process` | ProcessStep x4 (2 columns on mobile) | I-08 (v1), I-16 (v2) | |
| H7 | Values | `values` plus three tag words | Feature surface, heading with KeywordTag x3, ValueRow x3, flat colour blocks | I-06, I-08 | Blocks hidden on mobile |
| H8 | Numbers | `stats`, heading, lead | Feature surface with dot texture (no gradient), StatTile x4 staggered | I-17 | O-09: photo backdrop later |
| H9 | Marquee | Derived from `capabilities` names | Marquee | I-18 | Decorative |
| H10 | Contact CTA | `profile.email` | Heading, EmailDisplay as `mailto:` link, copy Button | I-19, I-20 | Letters static on touch |
| H11 | Footer | `site.footer`, `profile.socials`, `site.timezone` | Footer: pages, social, local time, copyright | I-21 | Social links without a URL are not rendered |

## 3. Work (`/work`)

| ID | Section | Content | Components | Interactions | States and notes |
|---|---|---|---|---|---|
| W1 | Header | Title, live count | `display-page` h1, superscript count | I-09 | Count follows the filter |
| W2 | Toolbar | Categories derived from `projects` | FilterBar (Chip), ViewToggle | I-22, I-23 | Active chip uses accent; keyboard operable; `aria-pressed` |
| W3 | Projects | All `projects` | ProjectCard in grid (2 columns) or list | I-13, I-14, I-24 | Empty filter: message plus reset chip |
| W4 to W6 | Capabilities, Process, CTA band | Shared blocks | | | |

## 4. Case Study (`/work/[slug]`)

| ID | Section | Content | Components | Interactions | Notes |
|---|---|---|---|---|---|
| C1 | Header | Title, role, year, tags, links | `display-page` h1, Chip | I-14 (arrival), I-09 | Cover expands from the clicked card |
| C2 | Body | `project.sections`: overview, problem, solution, results; media | MetaSidebar (sticky), `heading-case` h2, body text | I-25, I-27, I-08 | Meta static on mobile |
| C3 | Compare | `project.compare` (before, after) | CompareSlider | I-26 | Section omitted if absent |
| C4 | Results | `project.results` or global `stats` | Numbers block | I-17 | |
| C5 | Process | Shared | | | |
| C6 | More work | Two other projects | ProjectCard x2 | I-13, I-14 | |
| C7 | Pull to next, CTA | Next project by order | Pull panel, CTA band | I-28 | Link fallback |

## 5. About (`/about`)

| ID | Section | Content | Components | Interactions |
|---|---|---|---|---|
| A1 | Intro | `profile.portrait`, `profile.bio`, headline | PortraitSpotlight, `display-page` h1, body | I-29, I-30 |
| A2 | Skills | `skills` | SkillChips | I-31 |
| A3 | Experience | `experience` | ExperienceRow list with hairline dividers | I-32, I-08 |
| A4 to A7 | Values, Numbers, Open to, CTA band | Shared blocks | | |

## 6. Contact (`/contact`)

| ID | Section | Content | Components | Interactions |
|---|---|---|---|---|
| K1 | Header and form | Title, form labels | `display-page` h1, Form (FormField x3, Button) | I-33 |
| K2 | Availability | `profile.availability`, email, socials, time zone | Dot, copy Button, social links | I-20, I-12 |
| K3, K4 | Process, Open to | Shared blocks | | |

## 7. 404

| ID | Section | Content | Components | Interactions |
|---|---|---|---|---|
| N1 | Not found | `site.notFound` | `display-hero` style "404", text, Button | I-35 |

## 8. Cross-Cutting States

- **Long titles:** wrap; never truncate headings.
- **Missing image:** the shapes remain; a neutral block replaces the image; alt text is still read.
- **Form failure or offline:** inline message plus `mailto:` fallback.
- **Clipboard failure:** show the address as text.
- **No JavaScript:** content visible, accordions open, no motion.
- **Print:** out of scope for v1.
