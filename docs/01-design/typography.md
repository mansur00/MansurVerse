# Typography

> Type is the main visual of this site. Sizes below are fluid (`clamp(min, preferred, max)`) and **Assumed** from the prototype until verified against ollyo.com (O-01). Last updated: 2026-11-18.

## 1. Fonts

| Token | Family | Weights | Used for |
|---|---|---|---|
| `--font-display` | Jersey 20 | 400 only | `h1` only |
| `--font-label` | Stack Sans Notch | 600 and 700 (variable 200–700) | `h2` to `h6`, small uppercase labels, stat numbers |
| `--font-body` | Plus Jakarta Sans | 400, 500, 600 (variable) | Body, statements, descriptions, chips, buttons, tags, email display |

No other fonts. Fallback stacks: display `ui-monospace, monospace`; label and body `system-ui, sans-serif`.

**Verified against ollyo (D-28).** ollyo's CSS declares the families Jersey 20, Jersey 25, Stack Sans Notch, Plus Jakarta Sans and Inter, and its base body font stack is the system sans stack. Where Jersey 25 and Inter are used is unconfirmed (O-13); this project uses only the three fonts above.

**Licences (O-02).** Stack Sans Notch is an open-source (OFL) variable font available on Google Fonts. Jersey 20 and Plus Jakarta Sans are also distributed through Google Fonts; confirm their OFL licences before self-hosting in Phase 2 and store the licence text in the repo.

**Logo (decided, D-29).** The wordmark is "MansurVerse": "Mansur" in Jersey 20 and "Verse" in Stack Sans Notch, on one baseline with no space. It is a brand mark, so it is the only non-`h1` use of Jersey 20. Weights: Jersey 20 at 400, Stack Sans Notch at 700 (Assumed). Size and clear space are defined in `component-specs.md`.

## 2. Loading Strategy

- Self-host WOFF2, Latin subset, `font-display: swap`.
- Preload the two fonts needed above the fold: Jersey 20 (hero `h1`) and Plus Jakarta Sans (body).
- Define fallback faces with `size-adjust` and metric overrides to minimise layout shift.
- `font-synthesis: none` so Jersey 20 is never faux-bolded.

## 3. Text Roles

Components use roles, not raw sizes. Each role is a token group (`--text-{role}-size`, `-line`, `-tracking`, `-weight`, `-font`).

| Role | Element | Font | Weight | Size | Line | Tracking | Use |
|---|---|---|---|---|---|---|---|
| `display-hero` | `h1` | display | 400 | `clamp(104px, 33vw, 440px)` | 0.8 | 0 | Home hero headline |
| `display-page` | `h1` | display | 400 | `clamp(60px, 13vw, 184px)` | 0.88 | 0 | Work, Case, About, Contact titles; 404 |
| `heading-section` | `h2` | label | 700 | `clamp(40px, 8.5vw, 128px)` | 0.98 | -0.02em | Section headings |
| `heading-case` | `h2` | label | 700 | `clamp(32px, 4.4vw, 60px)` | 0.98 | -0.02em | Case study sub-headings |
| `heading-card` | `b`/`h3` | label | 700 | `clamp(28px, 3.6vw, 52px)` | 1 | -0.02em | Project card title |
| `heading-row` | `h3` | label | 700 | `clamp(22px, 3.6vw, 48px)` | 1 | -0.02em | Capability rows |
| `heading-step` | `h3` | label | 700 | `clamp(26px, 3vw, 40px)` | 0.98 | -0.02em | Process steps |
| `heading-job` | `h3` | label | 700 | `clamp(22px, 2.6vw, 36px)` | 0.98 | -0.02em | Open-to rows |
| `label` | `span` | label | 600 | `0.95rem` | 1 | 0 | Uppercase "/" labels, uppercase |
| `stat` | `b` | label | 700 | `clamp(52px, 7.5vw, 112px)` | 1 | 0 | Stat numbers |
| `statement` | `p` | body | 600 | `clamp(28px, 5.4vw, 76px)` | 1.02 | -0.03em | Home statement; max 22ch |
| `value-text` | `p` | body | 500 | `clamp(20px, 2.6vw, 36px)` | 1.15 | -0.02em | Values descriptions; max 34ch |
| `email-display` | `div` | body | 600 | `clamp(28px, 7vw, 100px)` | 1 | -0.04em | Contact CTA email |
| `body` | `p` | body | 400 | `clamp(16px, 1.2vw, 19px)` | 1.3 | -0.02em | Default text; max 60ch |
| `body-small` | `p`/`span` | body | 400 | `0.85–0.9rem` | 1.3 | -0.01em | Meta, captions, footer fine print |
| `chip` / `button` | `span`/`button` | body | 600 | `0.95–1rem` | 1 | -0.01em | Chips, pills |
| `tag` | `span` | body | 600 | `clamp(14px, 2.2vw, 28px)` | 1 | -0.02em | Keyword tags |

## 4. Rules

1. **Element level decides the font.** `h1` is always Jersey 20; `h2` to `h6` are always Stack Sans Notch. Visual size is separate from semantic level: a component takes an `as` prop (semantics) and a `role` prop (look). An `h1` never gets a Stack Sans role, and an `h2` never gets a Jersey role.
2. **Case is authored in content.** Only labels use `text-transform: uppercase`.
3. **Max widths:** body 60ch, statement 22ch, value text 34ch, intro 34ch.
4. **Never below 16px** for body text. Fluid minimums above are floors.
5. **Overflow:** huge headings must wrap, never overflow the viewport, including at 200% browser zoom. Use `overflow-wrap: anywhere` as a last resort.
6. **Counters** use tabular figures where the font supports them so numbers do not jitter while counting; verify in Phase 2.
7. **Contrast:** see `color-tokens.md`.

## 5. Verification (O-01)

Font families are verified (D-28). Still to verify: which font each element uses, real sizes, line-heights and letter-spacing. ollyo's base CSS sets antialiased font smoothing (adopt it) and `line-height: 1.5` on the body; our `body` role uses 1.3, Assumed from the screenshots. Do not set CSS `scroll-behavior: smooth`; Lenis handles smooth scrolling (D-32).
