# CRK-05 — IPL history

**Purpose:** every IPL season with champion, final, awards, auctions and playoff bracket.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Playoff bracket errors are ignored; no retry. | `cricket.ipl.history.tsx` |
| 2 | Medium | States | No branded error boundary; empty/filter/results use local markup. | route |
| 3 | Medium | A11y | Search/team select unlabelled; era chips lack `aria-pressed` and height. | filters |
| 4 | Medium | A11y | Expand buttons lack `aria-expanded`/`aria-controls`; auction bars expose data only via `title`. | cards/chart |
| 5 | Low | Bug | Champion card click both navigates and sets a filter that is then discarded; year arrays are sorted in place. | Hall |
| 6 | Low | Motion | Hover translate ignores reduced motion. | Hall |
| 7 | Low | Copy | Chart says “18 auctions” regardless of data. | chart |
| 8 | Low | SEO | No CollectionPage JSON-LD. | head |

## Keep

- SSR history loader, season cards, era/team/search filters.
- Hall of Champions, auction trend, auction headlines and bracket accordions.
- Player and team links.

## Fix

1. Bracket error state with Retry.
2. Branded route error boundary; shared empty states with clear filters.
3. Labels, `aria-pressed`, 44 px controls.
4. `aria-expanded` + region ids; sr-only bar descriptions.
5. Remove the discarded filter write; copy years before sorting.
6. Reduced-motion guards.
7. Use the real auction count.
8. CollectionPage JSON-LD.

## Test plan

- Typecheck, tests, build.
- SSR IPL history 200 with season cards and Hall of Champions.
- Filters and accordions still work (code review).
- Bracket error/empty reviewed.

## Phase checklist

- [x] Phase 1: bracket Retry; branded route error boundary.
- [x] Phase 2: season-card layout kept.
- [x] Phase 3: existing IPL tokens kept.
- [x] Phase 4: shared filter/bracket empty states.
- [x] Phase 5: labelled controls, `aria-pressed`, 44 px targets, `aria-expanded`/`aria-controls`, sr-only auction bars, reduced motion, hidden icons.
- [x] Phase 6: CollectionPage JSON-LD; real auction count.
- [x] Phase 7: removed discarded filter write and in-place sort mutation.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR IPL history 200 with 18 champions and CollectionPage.
