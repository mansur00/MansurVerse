# Forms and Integrations

> The contact form and every external service the site uses. Last updated: 2026-11-19.

## 1. Contact Form

### Fields and validation

| Field | Rules | Autocomplete |
|---|---|---|
| Name | Required, 2 to 80 characters | `name` |
| Email | Required, valid address | `email` |
| Message | Required, 10 to 2000 characters | none |
| Honeypot | Hidden from people and assistive tech; must stay empty | none |

Validation runs on blur and on submit, in the browser and again at the provider or endpoint. All labels, errors and messages come from `site.form`.

### States (I-33)

Idle, then sending (button disabled, label "Sending…"), then sent (success message, form reset, button "Sent ✓" for 2200ms) or failed (message with a `mailto:` fallback, form values kept). Focus moves to the first invalid field on error and to the success message on success. Messages use `role="alert"` or `aria-live="polite"` appropriately.

### Spam protection (baseline)

Honeypot field plus a minimum time-to-submit check. A provider-side or challenge-based control (for example Cloudflare Turnstile or the provider's own protection) can be added once the provider is chosen. Rate limiting is the provider's responsibility.

### Submission interface

`submitContact(payload): Promise<{ok: true} | {ok: false, reason}>` in one module. The provider is swapped by changing this module only. Requests use `fetch` with JSON; no page reload; no secrets in client code. The endpoint URL comes from `PUBLIC_` environment variables.

## 2. Provider Choice (O-05, decided in Phase 5)

Criteria: works with a static site; no secret in the browser; reliable delivery; spam controls; privacy posture; cost at low volume; ease of replacing it. Candidate approaches: a hosted form-endpoint service, or one serverless function on the chosen host that sends email through a transactional email service. Verify current pricing and terms at decision time and record the choice in the decision log.

## 3. Other Integrations

| Integration | Default | Notes |
|---|---|---|
| Email link | Plain `mailto:` from `profile.email` | Owner publishes the address anyway; obfuscation would break no-JS use |
| Social links | From `profile.socials`; links without a URL are not rendered | `rel="noopener noreferrer"` |
| CV | Static PDF in `public/`, linked from `profile.cvUrl` | Optional |
| Analytics (O-06) | None by default | If added: cookieless and privacy-friendly; decide against the owner's legal requirements; record in the decision log |
| Error monitoring | None by default | Static site; optional later |
| Fonts | Self-hosted | No third-party font requests |
| Open Graph images | Generated at build from content (design in `seo-and-metadata.md`) | |

## 4. Privacy

Collect only name, email and message. Do not store submissions in the repository. Show a short privacy note under the form (copy from `site.form.privacyNote`). No third-party scripts load on page view unless recorded in the decision log.

## 5. Tests

Unit: validators. Playwright: each state of the form (mock the endpoint), keyboard-only completion, focus placement, failure fallback, honeypot rejection. Manual in Phase 8: a real submission reaches the owner's inbox.
