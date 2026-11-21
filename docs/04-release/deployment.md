# Deployment

> Hosting, CI/CD, domain, headers, rollback. Details marked "verify" must be re-checked against current provider docs at setup. Last updated: 2026-11-19.

## 1. Hosting Decision (O-03 - Decided: Vercel)

The site is deployed on **Vercel** connected directly to the GitHub repository (decision D-86). Pushes to `main` deploy to production; pushes to any feature branch or pull request create isolated preview deployments with unique URLs.

| Criterion | Implementation on Vercel |
|---|---|
| Static Astro without an adapter | Yes: Astro builds static HTML to `dist`, served via Vercel's Edge Network |
| Preview deploys per PR | Built-in: automatic per-branch/PR preview deployment |
| Environment variables | Configured per environment (Production, Preview, Development) in the Vercel dashboard |
| Node & Package Manager | Automatic: Corepack honors `packageManager` (pnpm 12.21.0); Node version from `.nvmrc` (24.x) |
| Rollback | Instant rollback to any previous deployment via the Vercel dashboard |

## 2. Vercel Configuration & Settings

No `vercel.json` file is required; Astro's static build output is auto-detected and zero-config on Vercel.

### Project Settings
- **Framework Preset:** Astro
- **Build Command:** `pnpm run build` (executes `tokens:build && astro build && node scripts/strip-styleguide.mjs`)
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Node.js Version:** 24.x (inferred from `.nvmrc`)

### Environment Variables per Environment

| Variable | Preview | Production (Build Phase) | Production (Launch) | Purpose |
|---|---|---|---|---|
| `PUBLIC_SITE_STAGE` | `development` | `development` | `production` | When `development`: every page gets `<meta name="robots" content="noindex, nofollow">` and `robots.txt` disallows all crawling |
| `PUBLIC_ENABLE_STYLEGUIDE` | `true` | `true` | `false` (or unset) | Preserves `/styleguide` in `dist` during build phase review; strips it before launch |
| `PUBLIC_SITE_URL` | Auto (or unset) | `http://localhost:4321` (preview) | `https://mansurverse.dev` | Canonical site URL for sitemaps and SEO metadata |

### How to Find Preview URLs
1. **In GitHub:** Each push to a feature branch or open PR triggers a Vercel build check. Click the "Details" link in the GitHub checks list to jump directly to the preview deployment.
2. **In Vercel Dashboard:** Open the project dashboard $\rightarrow$ navigate to the **Deployments** tab. The latest deployment for the branch is shown with its active preview URL (e.g. `https://mansurverse-<hash>-mansurs-projects.vercel.app`).

### How to Roll Back
1. **Instant Rollback via Vercel Dashboard:**
   - Go to Project $\rightarrow$ **Deployments**.
   - Locate the last known good production deployment.
   - Click the three dots menu (`...`) and select **Promote to Production** or **Instant Rollback**.
2. **Git Revert:**
   - Revert the problematic commit on `main` (`git revert <commit>`).
   - Push to `main`; Vercel will immediately build and deploy the reverted state.

## 3. Environments

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
