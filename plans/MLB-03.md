# MLB-03 — MLB history

**Purpose:** historical timeline plus season leader snapshots.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Season-leader query had no error/retry and an ad-hoc empty state. |
| 2 | Medium | A11y | Season select and batting/pitching toggles under 44 px; no labels or pressed states. |
| 3 | Low | Tokens | Hardcoded white text. |

## Fix

1. Shared error/empty states in the history component; route error boundary.
2. Labelled 44 px select and toggle buttons with `aria-pressed`.
3. Token text.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
