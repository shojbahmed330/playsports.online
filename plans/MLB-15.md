# MLB-15 — MLB teams

**Purpose:** searchable directory of all 30 franchises.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Query errors and empty results show an empty grid. |
| 2 | Medium | A11y | Search input unlabelled; icon announced; input under 44 px; no focus ring token. |

## Fix

1. Error state with retry; shared empty states for no teams/no matches.
2. Label + 44 px input + hidden icon + focus ring.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200/404).
