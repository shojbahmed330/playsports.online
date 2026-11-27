# CRK-08 — IPL records

**Purpose:** all-time IPL record book plus a live per-season leaderboard panel.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Season leaderboard errors are ignored; no retry. | `cricket.ipl.records.tsx` |
| 2 | Medium | States | No branded error boundary for the route. | route |
| 3 | Medium | A11y | Search, sort and leaderboard selects are unlabelled; chips lack `aria-pressed` and height. | controls |
| 4 | Low | States | No-result box duplicates the shared `EmptyState` and has no clear action. | body |
| 5 | Low | Copy | “Live” badge is shown even when a historic season is selected. | panel |
| 6 | Low | Motion | Record cards translate on hover regardless of reduced motion. | cards |
| 7 | Low | SEO | No CollectionPage JSON-LD. | head |

## Keep

- Static all-time record book, search/category/sort controls.
- SSR shell and live season leaders panel.
- Player links and record counts.

## Fix

1. Leaderboard error state with Retry.
2. Branded route error boundary.
3. Labels for all controls, `aria-pressed`, 44 px targets.
4. Shared empty state with “Clear filters”.
5. Neutral season badge; count has an sr-only label.
6. Reduced-motion guard.
7. CollectionPage JSON-LD.

## Test plan

- Typecheck, tests, build.
- SSR IPL records 200 with record sections.
- Search/filter/sort still work (code review).
- Error and empty paths reviewed.

## Phase checklist

- [x] Phase 1: leaderboard retry state; branded route error boundary.
- [x] Phase 2: existing record grid/layout kept.
- [x] Phase 3: existing IPL tokens kept.
- [x] Phase 4: shared empty states for no results and no leaders.
- [x] Phase 5: labelled controls, `aria-pressed`, 44 px targets, reduced motion, accessible counts.
- [x] Phase 6: CollectionPage JSON-LD; neutral season badge.
- [x] Phase 7: removed duplicated local empty markup.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR IPL records 200 with labelled controls and CollectionPage.
