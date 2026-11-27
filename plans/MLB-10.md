# MLB-10 — MLB records category

**Purpose:** SSR all-time leaderboard by category.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Bespoke not-found; empty rows rendered a header-only table; no route boundary. |
| 2 | Medium | A11y | Table lacked caption/`scope`; row links under 44 px; hardcoded white surfaces. |
| 3 | Low | SEO | No OG site name/Twitter meta. |

## Fix

1. Shared error/not-found/empty states.
2. Table caption/`scope`; 44 px links/focus rings; token surfaces.
3. OG site name/Twitter meta.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200/404).
