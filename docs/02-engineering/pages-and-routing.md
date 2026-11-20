# Pages and Routing

> Routes, page data, layout, head contents and navigation behaviour. Production uses real routes (the prototype's hash routing is not carried over). Last updated: 2026-11-19.

## 1. Routes

| Route | File | Data | Notes |
|---|---|---|---|
| `/` | `pages/index.astro` | `home`, `projects`, `capabilities`, `process`, `values`, `stats`, `profile`, `site` | |
| `/work` | `pages/work/index.astro` | `projects`, `site.categories`, shared blocks | Filter and view state live in the island |
| `/work/[slug]` | `pages/work/[slug].astro` | One project, neighbours by `order`, shared blocks | `getStaticPaths` from the collection |
| `/about` | `pages/about.astro` | `profile`, `skills`, `experience`, `values`, `stats`, `open-to` | |
| `/contact` | `pages/contact.astro` | `profile`, `site.form`, `process`, `open-to` | |
| `/404` | `pages/404.astro` | `site.notFound` | Served for unknown paths |
| `/styleguide` | `pages/styleguide.astro` | Tokens, components, interactions | `noindex`; preview and development builds only |

An invalid project slug resolves to the 404 page. There are no query parameters and no client-side route params.

## 2. URL Rules

- Trailing slash policy: none (`/work`, not `/work/`); one canonical form with redirects handled by the host.
- Lowercase kebab-case slugs; stable after publishing.
- Canonical URL on every page from `site.url`.
- External links open with `rel="noopener noreferrer"`; internal links never use `target`.

## 3. Layout and Head

One `BaseLayout.astro` takes `title`, `description`, `ogImage`, `noindex`. Head order:

1. Charset, viewport (`width=device-width, initial-scale=1, viewport-fit=cover`).
2. Inline theme script (runs before paint; see `tokens-implementation.md`).
3. Title, description, canonical, Open Graph and Twitter tags (details in `seo-and-metadata.md`).
4. Font preloads (Jersey 20, Plus Jakarta Sans) and generated token CSS.
5. `<ClientRouter />` for transitions.

Body: skip link, Nav, `<main id="main">`, Footer, Cursor. Nav, Cursor and Footer are persisted across navigation.

## 4. Navigation Behaviour

- Router: Astro `<ClientRouter />` (D-48). Scripts re-initialise on `astro:page-load`.
- Shared-element transition: each project card art and the matching case-study header art share `transition:name="project-art-{slug}"`.
- Nav and cursor use `transition:persist` so they survive navigation.
- Without View Transitions support the router falls back to an animated swap; reduced motion disables the transition animation but navigation still completes.
- Scroll: new page starts at the top; browser back restores the previous position; Lenis is notified after the swap and ScrollTrigger refreshes.
- Focus: after navigation, move focus to the page `h1` (tabindex -1) and announce the new page title through a polite live region.
- In-page anchors (case-study sections) use heading ids and scroll via Lenis.
- Keyboard and screen-reader users must be able to complete every navigation without the transition.

## 5. Case-Study Neighbours

"More work" shows two projects other than the current one, by nearest `order`. "Pull to next" targets the next project by `order`, wrapping to the first.

## 6. Sitemap, Robots, Feeds

`sitemap.xml` generated at build from the routes above (excluding `/styleguide` and `/404`). `robots.txt` allows all except `/styleguide`. No RSS in v1 (no blog).

## 7. Tests

Playwright covers: every route returns 200 (404 for unknown), correct title and canonical, nav links, project card to case study and back, focus placement after navigation, reduced-motion navigation, and no broken internal links.
