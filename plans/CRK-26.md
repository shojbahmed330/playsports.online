# CRK-26 — tournaments index

**Purpose:** hub for every cricket tournament grouped by international, franchise and domestic.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Low | A11y | Main lacks `id="main-content"`; cards lack a visible focus ring; card titles are plain `<p>`. | `cricket.tournaments.index.tsx` |
| 2 | Low | States | No shared empty state if the tournament list is empty. | body |
| 3 | Low | Consistency | Head formatting/blank lines are noisy. | head |

## Keep

- Static tournament groups and detail links.
- CollectionPage, breadcrumb and item-list JSON-LD.

## Fix

1. `main-content` id, focus-visible ring, `h3` card titles.
2. Shared empty state.
3. Format the head block.

## Test plan

- Typecheck, tests, build.
- SSR tournaments index 200 with grouped tournament links.
- Empty path reviewed.

## Phase checklist

- [x] Phase 1: shared empty state.
- [x] Phase 2: grouped layout kept.
- [x] Phase 3: existing tokens kept.
- [x] Phase 4: empty state added.
- [x] Phase 5: `main-content` id, focus-visible cards, `h3` titles.
- [x] Phase 6: JSON-LD retained.
- [x] Phase 7: head block formatted.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR index 200 with grouped links.
