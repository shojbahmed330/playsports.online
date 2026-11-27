# CRK-24 — Cricket teams index

**Purpose:** find any cricket team across the tracked leagues and open its profile or series.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Bug / data | Every team card links to `/cricket/series/<league>` instead of the team profile. | `cricket.teams.index.tsx` |
| 2 | High | Perf / SEO | No loader; 10 league-team queries fire only after hydration and SSR shows a skeleton. | route |
| 3 | High | States | No error state; a failed league is silently missing. | route |
| 4 | Medium | Perf | `useMemo` depends on the `queries` array, which is new on every render. | component |
| 5 | Medium | A11y | Search input has no label; chips are ~24 px tall; skeleton pulses ignore reduced motion. | filters/skeleton |
| 6 | Low | UI | Empty state is a hardcoded dashed box. | body |

## Keep

- Search by name/abbr.
- League filter chips.
- Crest + name + abbr cards.
- Grouping by league with dedupe.

## Fix

1. Link to `/cricket/teams/<slug>` when a profile exists; otherwise fall back to the series page (no new 404s).
2. `ensureQueryData` for all league team lists in the loader (parallel, settled).
3. Error state when every league fails; inline notice for partial failure.
4. Shared empty state with Clear search.
5. Label the search input; 44 px chips; reduced-motion skeleton.

## Test plan

- Typecheck, tests, build.
- SSR contains team cards (or a truthful loading state).
- Click a team with a profile → profile; without → series.
- All leagues fail → ErrorState retry.
- Search/filter empty → EmptyState reset.
- Browser 0 hydration/errors.

## Phase checklist

- [x] Phase 1: team cards link to profiles when they exist, series otherwise; all-error and partial-error states.
- [x] Phase 2: shared empty state with Clear filters.
- [x] Phase 3: token labels and 44 px chips.
- [x] Phase 4: loading, empty, all-error retry, partial notice.
- [x] Phase 5: labelled search, 44 px chips, reduced-motion skeleton.
- [x] Phase 6: loader `ensureQueryData` across leagues; SSR contains team cards.
- [x] Phase 7: removed hardcoded empty box; extracted card body.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR 2 profile + 7 series links; browser 9 teams, 0 hydration/errors.

**Note:** ESPN's league team endpoints currently return only 9 teams in this environment; the page shows what the feed provides and never fabricates teams.
