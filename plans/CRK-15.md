# CRK-15 — Cricket players index

**Purpose:** discover top-ranked cricket batters, bowlers and all-rounders across formats.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Code / data | Rankings JSON is read through `any`; a shape change silently empties the page. | `cricket.players.index.tsx` |
| 2 | Medium | Data UX | Ratings from T20I/ODI/Test are mixed and sorted together; the numbers are not directly comparable. | sort |
| 3 | Medium | A11y | Search has no label; role/format chips are ~24 px and lack `aria-pressed`. | filters |
| 4 | Medium | States | Empty state is a hardcoded dashed box with no reset. | body |
| 5 | Low | Data trust | No snapshot date; `slice(0, 60)` hides the fact that the list is capped. | body |
| 6 | Low | Internal linking | No link to the full rankings page. | header |

## Keep

- Flattened rankings across roles/formats.
- Search by player/team.
- Role and format filters.
- Player links and flags.

## Fix

1. Type the JSON and remove `any`.
2. Add a “format-specific ratings” note and show the visible/total count.
3. Shared `EmptyState` with Clear filters.
4. Label search; 44 px chips; `aria-pressed`.
5. Snapshot date + link to full rankings.
6. Token colours.

## Test plan

- Typecheck, tests, build.
- SSR shows player cards and snapshot date.
- Filters/search narrow the list; empty state resets.
- Browser console 0 errors (browser tool unavailable; SSR checked).

## Phase checklist

- [x] Phase 1: typed rankings data, removed `any`, shared empty state.
- [x] Phase 2: header action + filter/count row.
- [x] Phase 3: token labels; existing card design kept.
- [x] Phase 4: count (“Showing X of Y”), format-specific rating note, clear-filter empty state.
- [x] Phase 5: labelled search, `aria-pressed`, 44 px chips.
- [x] Phase 6: snapshot date + link to full rankings.
- [x] Phase 7: metadata `any` removed.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR 200 with 39 players, snapshot and count text.
