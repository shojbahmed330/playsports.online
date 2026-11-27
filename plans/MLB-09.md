# MLB-09 — MLB postseason

**Purpose:** year-selectable postseason bracket.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Query errors and empty brackets rendered blank; no retry. |
| 2 | Low | A11y | Year select unlabelled and under 44 px. |

## Fix

1. Shared error/empty states with retry.
2. Labelled 44 px select with focus ring.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
