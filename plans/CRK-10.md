# CRK-10 — IPL standings

**Purpose:** show the IPL points table by season with playoff cut-off and form.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | `data.error` is ignored; no retry. | `cricket.ipl.standings.tsx` |
| 2 | Medium | Internal linking | Team names are not linked to franchise pages. | table |
| 3 | Medium | A11y | Season select has no label; table has no caption/`scope`. | controls/table |
| 4 | Low | UI | Local empty state duplicates the shared component. | body |
| 5 | Low | Data UX | No indication of which season is shown beyond the picker value. | subtitle |

## Keep

- SSR season standings.
- Top-4 playoff highlighting, NRR, form chips.
- Season picker and URL state.

## Fix

1. Retry on feed error.
2. Link team names to `/cricket/ipl/teams/<teamId>`.
3. Label the season select; table caption + scope; 44 px select.
4. Shared EmptyState.
5. Subtitle includes the selected season.

## Test plan

- Typecheck, tests, build.
- SSR standings 200 with table or truthful empty state.
- Team links resolve.
- Season change updates table/URL.

## Phase checklist

- [x] Phase 1: feed Retry; team rows link to franchise pages.
- [x] Phase 2: subtitle shows the selected season.
- [x] Phase 3: existing IPL tokens kept.
- [x] Phase 4: shared empty state + error retry.
- [x] Phase 5: labelled select, table caption and `scope`.
- [x] Phase 6: SSR/SEO retained.
- [x] Phase 7: removed local empty box.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR standings 200 with caption and truthful empty state (off-season).
