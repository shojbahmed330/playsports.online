# CRK-20 — cricket series detail

**Purpose:** one series/league with live, upcoming and finished matches plus a derived standings table.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Query errors fall through to “No matches scheduled”; no Retry. | `cricket.series.$id.tsx` |
| 2 | Medium | States | Error/not-found use bare centered text instead of shared branded states. | route |
| 3 | Medium | A11y | Standings table has no caption/`scope`; section titles are `div`s. | table/blocks |
| 4 | Low | States | Local empty box duplicates the shared `EmptyState`. | body |
| 5 | Low | Motion | Live pulse ignores reduced motion. | `Stat` |
| 6 | Low | A11y | Hero emoji and back-arrow icon are exposed as content. | hero |

## Keep

- Client scoreboard query with live-only 25 s refetch.
- Hero, live/upcoming/results grids, derived standings.
- SportNav live count and JSON-LD.

## Fix

1. ErrorState with Retry when the query fails.
2. Shared error/not-found states with navigation.
3. Table caption/`scope`; `h2` section titles.
4. Shared EmptyState with Calendar icon.
5. Reduced-motion pulse.
6. Hide decorative emoji/icon.

## Test plan

- Typecheck, tests, build.
- SSR series page 200 for a known league id with hero and match sections.
- Unknown id still renders without crashing.
- Error/empty paths reviewed.

## Phase checklist

- [x] Phase 1: query ErrorState with Retry; shared route error/not-found states.
- [x] Phase 2: hero/sections layout kept.
- [x] Phase 3: existing tokens kept.
- [x] Phase 4: shared empty state with error copy.
- [x] Phase 5: table caption/`scope`, `h2` section headings, reduced-motion pulse, hidden decorative emoji/icon.
- [x] Phase 6: existing JSON-LD/meta retained.
- [x] Phase 7: removed bare local states.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR series 200 (matches hydrate client-side).
