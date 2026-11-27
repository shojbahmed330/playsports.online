# UTIL-02 — contact

**Purpose:** contact form plus optional email address.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Send failure only shows a toast; success has no inline confirmation. |
| 2 | Low | A11y | Inputs/controls under 44 px, hardcoded emerald focus, no focus ring on submit, icons announced. |
| 3 | Low | Forms | Missing `name`/autocomplete hints on fields. |

## Fix

1. Inline `role="alert"` error and `role="status"` success.
2. 44 px/token-styled controls, hidden icons, focus rings.
3. Add name/autocomplete attributes.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 error/success · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
