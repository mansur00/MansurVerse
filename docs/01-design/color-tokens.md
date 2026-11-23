# Color Tokens

> Colours marked **Verified** come from ollyo.com's live CSS root variables (owner-supplied, 2026-11-18). Colours marked **Assumed** were sampled by eye from screenshots or the prototype. ollyo has no dark theme, so every dark-theme value is our own design. Last updated: 2026-11-18.

## 1. Primitives (layer 1)

| Token | Value | Status | ollyo variable |
|---|---|---|---|
| `--palette-lime` | `#9FFA62` | Verified | `--ollyo_dp3ubfbe` |
| `--palette-lime-deep` | `#83DF4A` | Verified | `--ollyo_dp0o38c0` |
| `--palette-lime-yellow` | `#B7F626` | Verified | `--ollyo_dpq92qqu` |
| `--palette-sky` | `#4BC3FF` | Verified | `--ollyo_dp63n6pl` |
| `--palette-coral` | `#FF9696` | Verified | `--ollyo_dphxt5mi` |
| `--palette-forest` | `#0F1F05` | Verified | `--ollyo_dpkp41te` |
| `--palette-warm-grey` | `#464544` | Verified (role unconfirmed) | `--ollyo_dph6kmwa` |
| `--palette-charcoal` | `#3D3D3D` | Verified | `--ollyo_dp4og7rm` |
| `--palette-grey-100` | `#F1F1F1` | Verified (also the page background) | `--ollyo_dpbv65yl` |
| `--palette-white` | `#FFFFFF` | Verified | `--ollyo_dp72e0si` |
| `--palette-black` | `#000000` | Verified (body text colour) | `--ollyo_dpycko9t` |
| `--palette-pink` | `#ff6ad5` | Assumed | not in ollyo variables |
| `--palette-cyan` | `#22e3f0` | Assumed | not in ollyo variables |
| `--palette-blue` | `#2f5bff` | Assumed | not in ollyo variables |
| `--palette-grey-150` | `#f8f8f8` | Assumed | |
| `--palette-grey-200` | `#e6e6e6` | Assumed | |
| `--palette-dark-900` | `#101010` | Own design (dark theme) | |
| `--palette-dark-850` | `#181818` | Own design (dark theme) | |
| `--palette-dark-800` | `#1d1d1d` | Own design (dark theme) | |
| `--palette-dark-feature` | `#2b2b2b` | Own design (dark theme) | |

## 2. Semantic Tokens (layer 2)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg-base` | grey-100 | dark-900 | Page background |
| `--color-bg-alt` | grey-200 | dark-850 | Alt bands |
| `--color-bg-surface` | grey-150 | dark-800 | Neutral cards and steps |
| `--color-bg-feature` | charcoal | dark-feature | Dark feature sections |
| `--color-bg-card` | white | white | Project cards (fixed) |
| `--color-text-primary` | black | `#F1F1F1` | Main text |
| `--color-text-muted` | `#636363` | `#9a9a9a` | Secondary text (see section 4) |
| `--color-text-muted-on-card` | `#636363` | `#636363` | Muted text on white cards (fixed, because the card stays white in the dark theme) |
| `--color-text-on-feature` | white | white | Text on dark feature sections |
| `--color-text-on-accent` | black | black | Text on lime, yellow-lime, sky, coral, pink, cyan |
| `--color-text-on-blue` | white | white | Text on blue |
| `--color-accent-primary` | lime | lime | Primary accent |
| `--color-accent-secondary-1` to `-4` | sky, lime-yellow, pink, cyan | same | Keyword tags, project accent shapes |
| `--color-accent-blue` | blue | blue | Decorative blocks |
| `--color-button-inverse-bg` | forest | forest | Dark pill button on light surfaces |
| `--color-button-inverse-text` | lime | lime | Text on the inverse pill |
| `--color-divider` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.16)` | Hairline divider |
| `--color-divider-on-feature` | `rgba(255,255,255,.18)` | same | Divider on dark sections |
| `--color-focus` | current text colour | current text colour | Focus ring; lime on feature sections |

## 3. Component Bindings (layer 3, examples)

| Token | Binds to |
|---|---|
| `--card-bg` | `--color-bg-card` |
| `--card-text` | `--color-text-on-accent` |
| `--chip-accent-bg` | `--color-accent-primary` |
| `--chip-filled-bg` | `--color-bg-alt` |
| `--chip-outline-stroke` | `--color-divider` |
| `--button-primary-bg` | `--color-accent-primary` |
| `--button-inverse-bg` / `-text` | `--color-button-inverse-bg` / `-text` |
| `--tag-bg-1` to `-4` | `--color-accent-secondary-1` to `-4` |
| `--stat-tile-bg-a` / `-b` | lime / white |

Full bindings per component are in `component-specs.md`.

## 4. Contrast Requirements

WCAG AA: 4.5:1 for body text, 3:1 for large text (24px, or 18.66px bold, and up). Approximate checks, to be re-measured with a tool in Phase 2:

| Pair | Ratio (approx.) | Result |
|---|---|---|
| black on lime `#9FFA62` | very high | Pass |
| lime on forest `#0F1F05` | high | Pass |
| black on sky `#4BC3FF` | ~10 | Pass |
| black on pink / cyan | ~7+ | Pass |
| white on blue `#2f5bff` | ~5.2 | Pass |
| prototype muted `#8a8a8a` on `#f1f1f1` | ~3.1 | **Fail for body text** |
| prototype muted `#6f6f6f` on `#101010` | ~3.8 | **Fail for body text** |

So `--color-text-muted` is `#636363` (light) and `#9a9a9a` (dark). The token pipeline measured `#6b6b6b` at 4.27:1 on the alt band, so it was darkened; `--color-text-muted-on-card` exists because dark-theme muted text on a white card reaches only 2.81:1. The statement section's unfilled words are a transitional state and may be lighter; the final state is `--color-text-primary`. Small number labels on white cards use `--color-text-muted`.

## 5. Rules

- Components never reference primitives or raw hex.
- The only translucent colours are dividers, the digit field and decorative shapes.
- No gradients, except the masked portrait colour reveal. The Numbers section has no gradient. ollyo's root CSS contains WordPress default gradient presets; these are core defaults, not part of the design.
- The dark theme does not invert accents or the white cards.
- Section backgrounds follow the rhythm in `design-system.md`.

## 6. Still to Verify (O-01)

Pink, cyan and blue (not in ollyo's variables, probably inline or image-based), the mid-grey band and neutral card colours, and the role of warm grey `#464544`. Ask the owner to copy computed `background-color` for those elements from DevTools.

## 7. Implementation Note (Phase 2)

The authoritative values are in `src/styles/tokens/tokens.json`. Added primitives: grey-400 `#9A9A9A`, grey-600 `#636363` and the alpha primitives black-14, black-40, white-16, white-18 and grey-100-40. Added semantic tokens: `text-muted-on-card`, `focus-on-feature` (lime) and the `digit-field` alpha pair. `tokens:check` re-verifies every contrast pair in both themes on each run.
