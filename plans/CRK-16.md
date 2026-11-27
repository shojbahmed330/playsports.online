# CRK-16 — Cricket rankings

**Purpose:** show the bundled ICC team/player rankings by category and format, with movement.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Code | The whole data read and JSON metadata are `any`; wrong keys silently render an empty table. | `cricket.rankings.tsx` |
| 2 | Medium | Data | The bundled snapshot is dated 2026-06-01 (six months old) and labelled only “Source: … fallback”. | header/footer |
| 3 | Medium | A11y | Category/format buttons are ~28 px tall and lack `aria-pressed`. | filters |
| 4 | Medium | States | Empty state is a bare sentence; there is no explanation that the snapshot is static. | table |
| 5 | Low | UI | Mixed gray-* tokens and no table caption. | table |
| 6 | Low | Perf | Static JSON is fine; no network cost. | — |

## Keep

- Static bundled rankings (no paid API).
- Category × format selectors.
- Player links, flags, rating and trend.
- Canonical + breadcrumb.

## Fix

1. Type the JSON and remove all `any` from the happy path.
2. Add an honest “bundled snapshot, may lag ICC” note with the date.
3. `aria-pressed`, 44 px category/format buttons.
4. Shared `EmptyState` if a combination is missing.
5. Table caption, token colours, sticky header where possible.

## Test plan

- Typecheck, tests, build.
- SSR shows the default T20I team table and date.
- Category/format changes update rows and URL.
- Browser console 0 errors (browser tool unavailable this session; use SSR/status checks).

## Phase checklist

- [x] Phase 1: typed JSON, removed all happy-path `any`, shared empty state.
- [x] Phase 2: category/format controls preserved with clearer grouping.
- [x] Phase 3: token colours/caption/sticky header.
- [x] Phase 4: empty state + honest bundled-snapshot note.
- [x] Phase 5: `aria-pressed` and 44 px controls.
- [x] Phase 6: canonical/breadcrumb retained; no fake live-feed claim.
- [x] Phase 7: metadata `any` casts removed.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR 200 with 11 table rows (10 + header), India and snapshot note present.
