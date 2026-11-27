# MLB-12 — MLB standings

**Purpose:** division/league/wild-card standings with playoff probability.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Query errors and empty feed render an empty standings shell. |

## Fix

1. Error state with retry; empty state for no leagues.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
