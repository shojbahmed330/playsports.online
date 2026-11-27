# MLB-17 — World Series year

**Purpose:** SSR edition page with champion, runner-up, MVP, result and nearby years.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Bespoke not-found; no route boundary. |
| 2 | Low | A11y | Prev/next/related/team/player links under 44 px; hardcoded white surfaces. |
| 3 | Low | SEO | Missing edition indexable; no OG site name/Twitter meta. |

## Fix

1. Shared error/not-found states.
2. 44 px links/focus rings; token surfaces.
3. `noindex` when missing; OG site name/Twitter.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200/404).
