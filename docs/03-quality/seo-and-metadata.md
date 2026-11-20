# SEO and Metadata

> Search and sharing basics for a small portfolio site. Last updated: 2026-11-19.

## 1. Titles and Descriptions

- Title template from `site.seo.titleTemplate`, for example "{page} | MansurVerse"; Home uses the full tagline form.
- Description at most 160 characters, unique per page; a project's description is its `summary`.
- One `h1` per page that matches the page's purpose.

## 2. Head Tags

Canonical URL (from `site.url`), `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (with alt), Twitter card large image, theme-colour meta per theme, viewport with `viewport-fit=cover`. `/styleguide` carries `noindex`.

## 3. Open Graph Images

- 1200×630, generated at build from content so they never go stale: default image from `site.seo.ogImage`; one per project from its cover, title and accent colour on the flat pixel-shape template.
- The generation tool is decided in Phase 7; adding it needs a decision-log entry (AGENTS.md rule 8).

## 4. Structured Data (JSON-LD)

| Page | Type |
|---|---|
| Home and About | `Person` (name, job title, URL, social profiles) and `WebSite` |
| Case study | `CreativeWork` (name, author, dateCreated from year, image) |

Data comes from content files; no hand-written duplicates.

## 5. Crawling

`sitemap.xml` from the routes in `pages-and-routing.md`; `robots.txt` allows all except `/styleguide`; 404 returns a real 404 status; unknown project slugs are 404s.

## 6. Icons and Manifest

SVG favicon plus 180px Apple touch icon and manifest icons, derived from the wordmark (design in Phase 3); theme colour from tokens.

## 7. Content Practices

Meaningful alt text, descriptive link text, readable URLs, case-study pages with real text (not only images), fast loading (see `performance-budget.md`).

## 8. After Launch

Owner verifies the site in the search engines' webmaster tools, submits the sitemap, tests share previews on the main social platforms, and re-checks after the first week (`launch-checklist.md`).
