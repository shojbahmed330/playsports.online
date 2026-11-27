# MLB-11 — MLB scores

**Purpose:** date-scrubbed MLB scoreboard with all/live/upcoming/final filters.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Query errors displayed as “No games”; empty state ad-hoc. |
| 2 | Medium | A11y | Filter buttons lack `type`/`aria-pressed`, are under 44 px; hardcoded gray chips; pulse dot announced. |

## Fix

1. Error state with retry; shared empty state.
2. 44 px `aria-pressed` chips, token styles, hidden pulse dot.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
