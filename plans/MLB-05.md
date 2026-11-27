# MLB-05 — MLB news

**Purpose:** full MLB headlines feed.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Query errors and empty feeds render an empty news shell. |

## Fix

1. Error state with retry; empty state for no headlines.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
