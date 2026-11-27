# CRK-02 — cricket highlights index

**Purpose:** hub of classic cricket match highlights grouped by tournament.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Low | A11y | Main lacks `id="main-content"`; cards lack focus ring; card titles are plain `<p>`. | `cricket.highlights.index.tsx` |
| 2 | Low | States | No shared empty state when the highlight list is empty. | body |
| 3 | Low | Copy | Raw ISO dates are shown to users. | cards |

## Keep

- Tournament grouping and newest-first order.
- CollectionPage, breadcrumb and item-list JSON-LD.

## Fix

1. `main-content`, focus-visible cards, `h3` titles.
2. Shared empty state.
3. Human-readable match dates.

## Test plan

- Typecheck, tests, build.
- SSR highlights index 200 with grouped cards.
- Empty path reviewed.

## Phase checklist

- [x] Phase 1: shared empty state.
- [x] Phase 2: grouped card layout kept.
- [x] Phase 3: existing tokens kept.
- [x] Phase 4: empty state added.
- [x] Phase 5: `main-content` id, focus-visible cards, `h3` titles.
- [x] Phase 6: JSON-LD retained.
- [x] Phase 7: human-readable dates.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR highlights 200 with grouped cards.
