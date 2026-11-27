# MLB-16 — MLB team profile

**Purpose:** SSR team profile with schedule, roster, leaders, stats and injuries.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Bespoke not-found block; no route error boundary. |
| 2 | Medium | SEO | Missing team returned a canonical/og URL without `noindex`. |
| 3 | Low | A11y | Related-team links under 44 px; hardcoded white text. |

## Fix

1. Shared empty/error states.
2. `noindex` for missing teams; OG site name/Twitter meta.
3. 44 px related links + focus rings + tokens.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200/404).
