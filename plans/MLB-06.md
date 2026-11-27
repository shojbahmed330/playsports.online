# MLB-06 — MLB player profile

**Purpose:** ESPN-id player profile with career stats and game logs.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Missing player used a bare paragraph; query errors had no retry; no route boundary. |
| 2 | Low | SEO | Missing player was indexable; no OG site name. |

## Fix

1. Shared error/empty states, retry, route boundary.
2. `noindex` when no athlete; OG site name; announced loading.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
