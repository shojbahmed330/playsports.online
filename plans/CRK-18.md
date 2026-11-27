# CRK-18 — Cricket records index

**Purpose:** browse all-time cricket record categories and scan the leading players by format.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Code | `records as any`, `c: any`, `r: any` hide the JSON shape and make the page fragile. | `cricket.records.index.tsx` |
| 2 | High | Internal linking | Record cards are static tables with no link to the dedicated `/cricket/records/<category>` pages. | body |
| 3 | Medium | A11y | Search has no label; format chips are ~24 px. | filters |
| 4 | Medium | States | Empty state is a hardcoded dashed box with no reset. | body |
| 5 | Low | Data trust | No visible snapshot date. | header/footer |
| 6 | Low | Table | No caption / scope attributes. | cards |

## Keep

- Static records JSON.
- Search by category or player.
- Format filter.
- Player links, flags, values, extras.

## Fix

1. Type the JSON and remove all `any`.
2. Add “Full record” links to the category pages.
3. Shared `EmptyState` with Clear filters.
4. Label the search, 44 px chips.
5. Show the snapshot date and table captions.

## Test plan

- Typecheck, tests, build.
- SSR shows default categories and snapshot date.
- Category link resolves to a 200 detail page.
- Empty search shows clear-filter action.
- No hydration/console errors (browser tool unavailable; SSR checked).

## Phase checklist

- [x] Phase 1: typed JSON, removed `any`, category links added.
- [x] Phase 2: filter/empty layout tightened.
- [x] Phase 3: token borders/labels.
- [x] Phase 4: shared empty state with Clear filters.
- [x] Phase 5: labelled search, 44 px chips, table captions.
- [x] Phase 6: snapshot date visible; category URLs in sitemap already.
- [x] Phase 7: metadata `any` removed.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR 200 with 9 category cards; detail page 200.
