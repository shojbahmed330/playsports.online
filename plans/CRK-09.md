# CRK-09 — IPL scores

**Purpose:** browse every IPL fixture/result by season and status.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Feed-error banner has no Retry. | `cricket.ipl.scores.tsx` |
| 2 | Medium | A11y | Status chips are ~24 px and lack `aria-pressed`; season `<select>` has no label. | controls |
| 3 | Low | UI | A local `EmptyState` duplicates the shared component. | body |
| 4 | Low | Data UX | No “showing X of Y” count when a status filter is active. | header |
| 5 | Low | Consistency | Hardcoded white/black classes outside the IPL token set. | controls |

## Keep

- SSR season loader + 30 s refetch.
- Season picker, status chips, match grid.
- URL-backed `year`/`status` with default stripping.

## Fix

1. Add Retry to the feed-error banner.
2. `aria-pressed`, 44 px chips, labelled season select.
3. Use the shared `EmptyState`.
4. Show filtered/total count.
5. Keep the IPL visual language; no route changes.

## Test plan

- Typecheck, tests, build.
- SSR IPL scores 200 with match cards.
- Season/status filters update URL and list.
- Error path has Retry.
- Empty filter shows shared empty state.

## Phase checklist

- [x] Phase 1: feed retry + shared empty state with Show all.
- [x] Phase 2: filtered count row.
- [x] Phase 3: existing IPL tokens kept.
- [x] Phase 4: empty/error/loading handled.
- [x] Phase 5: `aria-pressed`, labelled season select, 44 px chips.
- [x] Phase 6: SSR/SEO retained.
- [x] Phase 7: removed local EmptyState.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR IPL scores 200 with count and labelled select.
