# Deployment

> Hosting, CI/CD, domain, headers, rollback. Details marked "verify" must be re-checked against current provider docs at setup. Last updated: 2026-11-19.

## 1. Hosting Decision (O-03)

The site is static, so any static host works. Default recommendation: **Cloudflare Workers static assets**. Reasons: Astro's own guide says Cloudflare recommends Workers over Pages for new projects; a pre-rendered Astro site needs no adapter or Worker code; static asset requests are free and unlimited, with generous file limits (verify current limits). Alternative: Vercel. The owner makes the final choice before Phase 8.

| Criterion | Cloudflare Workers static assets | Vercel |
|---|---|---|
| Static Astro without an adapter | Yes (Wrangler config points at `dist`) | Yes |
| Preview deploys per PR | Via Workers Builds or CI (verify) | Built in |
| Custom headers and redirects | `_headers` and `_redirects` files (verify limits) | Config file |
| Cost at portfolio scale | Expected near zero (verify) | Expected near zero (verify) |
| Serverless function for the form, if needed | Workers | Functions |

Cloudflare configuration notes: `wrangler.jsonc` with `assets.directory` set to `./dist` and `not_found_handling` set to `404-page` so unknown URLs serve the built 404 page; set `compatibility_date` to the first deploy date.

## 2. Environments

| Environment | Source | Purpose |
|---|---|---|
| Preview | Every pull request | Owner review, E2E, Lighthouse |
| Production | `main` | Live site |

Environment variables are set in the host or CI secret store; only `PUBLIC_` values reach the browser.

## 3. CI/CD

GitHub Actions (or the host's builder) on each PR runs the pipeline in `testing-qa.md` and deploys a preview; a merge to `main` runs the same checks, then deploys to production. Cache the pnpm store; pin Node from `.nvmrc`. Production deploys are never manual from a laptop except for emergency rollback.

## 4. Domain and DNS (O-11)

- One canonical host; the apex domain is canonical and `www` redirects to it (or the reverse; pick one and set `site.url` accordingly).
- DNS at the host or registrar; HTTPS certificates are automatic; enable HSTS after confirming HTTPS works everywhere.
- If the contact form or the owner's email uses the domain: SPF, DKIM and DMARC records for the sending service.

## 5. Headers

| Header | Value intent |
|---|---|
| Cache-Control for hashed assets (`/_astro/*`, fonts) | `public, max-age=31536000, immutable` |
| Cache-Control for HTML | Short or revalidate on every request |
| Content-Security-Policy | Default-src self; scripts self plus the hash of the inline theme script; fonts and images self; `connect-src` self plus the form endpoint; no third parties; `frame-ancestors` none |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | Disable unused features |

The inline theme script is the main CSP consideration: allow it by hash, and regenerate the hash in the build whenever the script changes.

## 6. Redirects and 404

Trailing-slash and `www` redirects at the host. Unknown paths serve the 404 page with a 404 status. Moved project slugs get explicit redirects.

## 7. Rollback

Production keeps previous deployments; rollback means redeploying the previous good version or reverting the commit on `main` and letting CI redeploy. The rollback is rehearsed once before launch (`launch-checklist.md`).

## 8. Monitoring

An uptime check on the home page and the contact endpoint; the owner's search-engine webmaster tools for crawl errors; the form is test-submitted monthly (`maintenance.md`).

## 9. Release Steps

1. All phase checks green on the preview.
2. Owner approves the preview.
3. Merge to `main`; CI deploys.
4. Smoke test production (pages, theme, form, 404).
5. Tag the release; note decision-log changes.
