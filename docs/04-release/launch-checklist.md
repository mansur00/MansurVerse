# Launch Checklist

> Every box must be ticked, or have an owner-approved exception in `decision-log.md`, before the site goes live. Last updated: 2026-11-19.

## Content
- [ ] Zero `placeholder: true` entries remain (build warns for each)
- [ ] Real name, role, bio, portrait, email, socials, availability, CV (if used)
- [ ] All projects have real covers, summaries, headings and results
- [ ] Alt text on every informative image; typography and punctuation checked
- [ ] No broken links (internal and external)

## Design and Interaction
- [ ] Every page and section matches `page-specs.md` and the approved design
- [ ] Every interaction passes its checklist, including reduced motion, motion toggle, touch, no-JS and no-WebGL
- [ ] Both themes reviewed on every page
- [ ] No shadows, no strokes beyond the listed exceptions, fonts follow the role table

## Performance and Accessibility
- [ ] All budgets in `performance-budget.md` met (or exceptions logged)
- [ ] axe clean on every page in both themes
- [ ] Keyboard-only and screen-reader walkthroughs done
- [ ] 200% zoom and 320px width checked

## SEO and Sharing
- [ ] Titles, descriptions, canonical URLs, Open Graph images, structured data
- [ ] `sitemap.xml` and `robots.txt` correct; `/styleguide` not indexed or deployed
- [ ] Share previews tested on the main social platforms
- [ ] Favicons and manifest present

## Legal and Privacy
- [ ] Font licences (Jersey 20, Stack Sans Notch, Plus Jakarta Sans) and GSAP licence text stored in the repo
- [ ] Privacy note on the form; analytics decision recorded (default none); consent need assessed if anything is added
- [ ] No unlisted third-party scripts

## Infrastructure and Security
- [ ] Hosting chosen (O-03) and production deploy works from CI
- [ ] Domain, DNS, HTTPS, canonical host and `www` redirect
- [ ] Security headers and CSP verified (including the inline theme script hash)
- [ ] 404 page served with a 404 status
- [ ] `pnpm audit` clean of high-severity issues; no secrets in the repo or client bundle
- [ ] Real contact-form submission reaches the owner's inbox
- [ ] Rollback rehearsed
- [ ] Uptime check configured

## Handover
- [ ] All docs match the code; `AGENTS.md` accurate; commands in `dev-environment.md` verified
- [ ] Open items in `decision-log.md` closed or consciously deferred
- [ ] Maintenance routine understood (`maintenance.md`)

## After Launch
- [ ] Sitemap submitted and site verified in the search engines' webmaster tools
- [ ] Day-one check of pages, form and analytics (if any)
- [ ] One-week check of crawl errors, performance and accessibility
