# Maintenance

> Routines that keep the site healthy, and how agents and the owner change it safely. Last updated: 2026-11-19.

## 1. Routine

| Frequency | Task |
|---|---|
| Weekly | Review dependency and security alerts; run the full suite on `main` |
| Monthly | Apply a batched dependency update (only releases at least 14 days old, one PR per group, full suite green); test-submit the contact form; check uptime history |
| Quarterly | Lighthouse and axe audit of every page; broken-link check; review fonts and licences; review the decision log for stale open items |
| Yearly | Review the design against the current state of the web, the stack choices in `tech-stack.md`, and domain and hosting renewals |

## 2. Common Changes

**Add a project:** create one MDX file and its images, run `verify`, open a PR, review the preview, merge. No code change is needed (`content-schema.md`).

**Edit copy:** change the content file; never the component.

**Change a design token:** edit the token source, run `tokens:build` and `tokens:check`, update the relevant design doc, log the decision, check both themes.

**Add a section or component:** write or update its spec first (`page-specs.md`, `component-specs.md`), then build it, then add it to `/styleguide`.

**Upgrade the framework:** read the upgrade guide, upgrade on a branch with the automated upgrade tool, run the full suite, review visual diffs, check transitions and scripts (they re-initialise on `astro:page-load`), then merge. Treat a major version as its own small project.

## 3. Rules for Agents

- Follow `AGENTS.md`; read specs before changing code.
- A change that alters behaviour updates the matching doc in the same PR.
- Decisions go in the decision log, assumptions marked "Assumed".
- Never bypass a guardrail; if a rule blocks a legitimate need, change the spec and log it first.
- Run `verify` before declaring any task done.

## 4. Incident Response

| Situation | Action |
|---|---|
| Site down or broken deploy | Roll back to the last good deployment (`deployment.md`), then investigate |
| Contact form failing | Show the `mailto:` fallback (already built in), check the provider, roll back if a deploy caused it |
| Security advisory on a dependency | Patch or pin a safe version, run the suite, deploy, note it in the decision log |
| Accessibility or performance regression | Treat as S2 (`testing-qa.md`); fix before the next release |

## 5. Ownership

The owner approves design and scope changes and every release. Contact details for the host, domain registrar and form provider are kept outside the repository (password manager), with their names listed in the decision log.

## 6. Record Keeping

Decisions and exceptions live in `decision-log.md`; release notes are Git tags with a short summary; budgets and thresholds change only through the documents that define them.
