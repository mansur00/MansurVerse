# Phase 1: Project Setup Runbook

> Step-by-step instructions for the owner or an agent to turn this repository into a working, guarded Astro project. The configuration files were written without running them (the authoring environment has no network), so Step 6 expects small fixes. Report errors back and the files are corrected. Last updated: 2026-11-19.

## Scope

Deliverables from `development-roadmap.md` Phase 1: Astro and TypeScript project, Tailwind 4 installed, lint, format and type-check, git conventions, CI skeleton, agent pointer files, folder structure, guardrail rules proven by a failing example. Tokens, fonts and the real pages are later phases.

## What Already Exists

Config: `.editorconfig`, `.gitignore`, `.nvmrc`, `.npmrc`, `.env.example`, `.prettierrc.json`, `.prettierignore`, `tsconfig.json`, `astro.config.mjs`, `eslint.config.mjs`, `stylelint.config.mjs`, `package.json`. Git and CI: `.husky/pre-commit`, `.github/workflows/ci.yml`, `.github/pull_request_template.md`. Agent pointers: `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/project.mdc`. Code: `src/` folder structure with placeholders, a temporary `src/pages/index.astro`. Guardrails: `scripts/test-guardrails.mjs` with `tests/guardrails/fixtures/`. The approved prototype is in `reference/`.

## Steps

1. **Check prerequisites.** Install Git and Node.js (Active LTS: confirm on nodejs.org). Run `corepack enable`.
2. **Initialise git.** `git init`, then commit the scaffold on `main`.
3. **Pin pnpm.** `corepack use pnpm@latest` writes the exact `packageManager` field into `package.json`. Check your pnpm version supports `minimum-release-age` (the 14-day rule in `.npmrc`); if not, enforce the rule by hand and note it in the decision log.
4. **Pin Node.** Replace `lts/*` in `.nvmrc` with the exact version you use. Read Astro 7's documented minimum Node version and add an `engines.node` range to `package.json`.
5. **Install dependencies** (exact versions come from `.npmrc`):

   ```
   pnpm add astro @astrojs/mdx @astrojs/sitemap tailwindcss @tailwindcss/vite gsap lenis ogl
   pnpm add -D typescript @astrojs/check eslint typescript-eslint eslint-plugin-astro eslint-plugin-jsx-a11y prettier prettier-plugin-astro stylelint stylelint-config-standard postcss-html vitest husky lint-staged
   ```

   Playwright, axe-core and Lighthouse CI are installed in the phases that use them (4 and 7).
6. **Run `pnpm run verify`** and fix what the first run reveals. Likely adjustment points:
   - Stylelint parsing `.astro` files (`postcss-html` custom syntax); if it fails, add the Astro-specific syntax package it names.
   - ESLint plugin config names for your installed `eslint-plugin-astro` version.
   - Astro 7 specifics in `astro.config.mjs` and `tsconfig.json` (for example integration option names).
   - Prettier reformatting of the scaffold files (`pnpm run format` once, then commit).
7. **Prove the guardrails.** `pnpm run test:guardrails` must report that `bad.css` is rejected for raw hex, `rgba()`, `box-shadow`, `border`, a literal `font-family` and `drop-shadow`, and that `good.css` passes. This runs inside `verify`.
8. **Enable git hooks.** `pnpm install` runs the `prepare` script and registers Husky; make a test commit with a deliberately badly formatted file and confirm lint-staged fixes or blocks it.
9. **Connect CI.** Push to GitHub, confirm the workflow is green (it uses `.nvmrc` and the `packageManager` field), then require it on `main` with branch protection. Check for newer major versions of the actions in the workflow file.
10. **Update the docs to match reality.** Record the exact versions and verified commands in `dev-environment.md` and `tech-stack.md`, close or adjust decisions in `decision-log.md`, and mark Phase 1 in `development-roadmap.md`.

## Not Yet Done on Purpose

`tokens:build` and `tokens:check` are placeholders until Phase 2. Tailwind is installed but not imported into any CSS yet; its theme is generated from tokens in Phase 2 (decision D-45). `test:e2e`, `test:a11y` and `lighthouse` are placeholders. The ESLint rules for hardcoded copy and Tailwind arbitrary values arrive with the components in Phase 3. The Stylelint exception files listed in the config do not exist yet; they are created in Phase 3.

## Exit Checklist

- [ ] Fresh clone installs with the lockfile and `pnpm run verify` passes
- [ ] `pnpm run test:guardrails` passes (bad fixture rejected, good fixture accepted)
- [ ] CI is green on a pull request and required on `main`
- [ ] Husky and lint-staged work locally
- [ ] Pointer files for each agent exist and name `AGENTS.md`
- [ ] Versions and commands recorded in the docs
- [ ] Owner approves the phase
