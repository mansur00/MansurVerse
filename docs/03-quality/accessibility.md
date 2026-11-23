# Accessibility

> Target: WCAG 2.2 level AA on every page, in both themes, with and without motion. Last updated: 2026-11-19.

## 1. Structure and Semantics

- `lang="en"` on `<html>`; one `h1` per page; heading levels follow the outline (visual size is separate, see `typography.md`).
- Landmarks: header or nav, one `main`, footer. A skip link is the first focusable element.
- Descriptive page titles; descriptive link text; lists marked up as lists.

## 2. Keyboard and Focus

- Every interactive element is reachable and operable by keyboard; no keyboard traps except the intentional menu overlay trap (Esc closes it, focus returns to the trigger).
- Focus is always visible (3px ring, `--color-focus`) and never hidden behind the sticky nav: use `scroll-padding-top` for the nav height.
- After route changes, focus moves to the page `h1` and the new title is announced in a polite live region.
- Hover-only behaviour has focus and tap equivalents (see `interaction-motion.md`).

## 3. Colour and Contrast

- Text 4.5:1 (3:1 for large text); UI components and focus rings 3:1; verified in both themes by `tokens:check` (`tokens-implementation.md`).
- Meaning is never carried by colour alone (form errors use text and an icon).

## 4. Text and Reflow

- Body text never below 16px; supports 200% zoom and reflows at 320px without horizontal scrolling (except content that scrolls inside its own container).
- Huge headings wrap instead of overflowing, including at zoom.
- Text spacing overrides (line height, letter and word spacing) do not break layouts.

## 5. Motion

- `prefers-reduced-motion` follows the fallback matrix; content is complete without motion.
- **Pause control (WCAG 2.2.2).** Automatic motion that lasts more than 5 seconds (digit field, floating tags, marquee) must be pausable. The footer has a motion toggle (I-37) that sets `data-motion="reduced"`, persists the choice, and starts from the OS preference.
- Nothing flashes more than three times per second over a large area. The digit field changes small, low-contrast areas near the cursor only; the check is repeated in Phase 7.

## 6. Pointer and Touch

- Targets are at least 44×44px by our rule (WCAG 2.2 minimum is 24px).
- Any drag interaction has a non-drag alternative: the compare slider is a native range input (keyboard and pointer); optional draggable skill chips must have a static equivalent.
- Content that appears on hover or focus (previews, labels) is dismissible, hoverable and persistent until dismissed.
- The custom cursor is additive; the system cursor stays visible.

## 7. Forms

- Every input has a visible, programmatically associated label and the right `autocomplete` token.
- Errors are identified in text, linked with `aria-describedby`, announced, and focus moves to the first error.
- Validation does not clear the user's input; failure offers a `mailto:` fallback.

## 8. Images and Media

- Informative images have meaningful alt text; decorative shapes are `aria-hidden`.
- Animated or split text keeps its full string in the accessible name (`animation-implementation.md`).
- Screenshots that contain important text are described in the alt text or surrounding copy.

## 9. Verification

| Check | When |
|---|---|
| axe-core on every page in both themes (Playwright) | Every PR |
| Keyboard-only walkthrough of all pages and interactions | Phase 7 and before launch |
| Screen reader smoke test (VoiceOver on iOS or macOS, NVDA on Windows) | Phase 7 and before launch |
| 200% and 400% zoom, 320px width | Phase 7 |
| Reduced motion, motion toggle, touch emulation, no-JS | Every PR (automated) and Phase 7 (manual) |
| Contrast re-measurement with a tool | Phase 2 and Phase 7 |

A failing automated check blocks merge; manual findings are logged as bugs with severity from `testing-qa.md`.
