# CRK-06 — IPL hub

**Purpose:** the IPL home for live scores, upcoming/recent matches, Orange/Purple Cap, standings and champions history.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Feed-error banner has no Retry; users must reload the page. | `cricket.ipl.index.tsx` |
| 2 | Medium | Internal linking | Points-table team names are plain text; no link to franchise profiles. | `MiniStandings` |
| 3 | Low | A11y | Hero live ping ignores reduced motion. | `IplHero` |
| 4 | Low | Copy | “Total titles” is passed as the number of seasons; accurate only if every season had one champion. | hero |
| 5 | Low | Consistency | Local `Section`/`MiniStandings` markup differs from shared headers/tables. | body |

## Keep

- SSR ensure for overview/history/caps.
- Hero, live/upcoming/recent, caps, standings preview, champions list.
- IPL sub-nav and affiliate strip.

## Fix

1. Add a Retry button that refetches the overview.
2. Link standings rows to `/cricket/ipl/teams/<teamId>`.
3. Reduced-motion hero ping.
4. Keep the local visual language (IPL dark) but align labels/heights.

## Test plan

- Typecheck, tests, build.
- SSR IPL hub 200 with live/upcoming/standings content.
- Team link resolves to an IPL team page.
- Error path has a working Retry (code-reviewed; feed failure not forced).
- Browser console 0 errors.

## Phase checklist

- [x] Phase 1: overview Retry added; standings team names link to IPL team pages.
- [x] Phase 2: existing IPL layout kept.
- [x] Phase 3: existing IPL tokens kept.
- [x] Phase 4: feed error now actionable.
- [x] Phase 5: hero ping respects reduced motion.
- [x] Phase 6: SSR ensure/SEO retained.
- [x] Phase 7: no new dead code.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR IPL hub 200 (standings/team links may be empty off-season).
