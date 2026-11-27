# UTIL-07 — unsubscribe

**Purpose:** token-based weekly-digest unsubscribe.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Loading/error states are bare text; error has no retry; missing-token message not announced. |
| 2 | Low | A11y | Confirm button under 44 px and no focus ring; spinner not labelled. |
| 3 | Low | SEO | No description/OG site name (noindex). |

## Fix

1. `role="status"`/`role="alert"` states plus retry.
2. 44 px token button, hidden spinner, focus rings.
3. Add OG site name.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 error/retry · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200 with/without token).
