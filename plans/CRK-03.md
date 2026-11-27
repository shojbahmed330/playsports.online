# CRK-03 — cricket history

**Purpose:** tournament switcher with all-time champions, runner-ups and run/wicket leaderboards.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | A11y | Champions list is a CSS grid, not a table; no caption/`scope`. | `cricket.history.tsx` |
| 2 | Medium | A11y | Tournament selector buttons lack `aria-pressed` and are under 44 px. | rail |
| 3 | Low | States | Empty champions/leaderboards render blank boxes; `SLUGS[0]` assumes data exists. | body |
| 4 | Low | A11y | Decorative trophy/award/target icons are announced. | hero/lists |
| 5 | Low | A11y | Footer back-link is under 44 px. | footer |

## Keep

- Tournament snap rail, hero summary, champions and leaders.
- Player links, breadcrumb JSON-LD, hub links.

## Fix

1. Real champions table with caption and column scopes.
2. `aria-pressed`, 44 px selector buttons.
3. Guard empty data; shared/inline empty states.
4. Hide decorative icons.
5. 44 px footer link.

## Test plan

- Typecheck, tests, build.
- SSR history 200 with table and leaderboards.
- Switching tournaments updates the table.
- Empty path reviewed.

## Phase checklist

- [x] Phase 1: champions table with caption/`scope`; empty states for data/leaderboards.
- [x] Phase 2: layout kept.
- [x] Phase 3: existing tokens kept.
- [x] Phase 4: empty-data guard and inline leaderboard note.
- [x] Phase 5: `aria-pressed` 44 px selector, hidden decorative icons, 44 px footer link.
- [x] Phase 6: JSON-LD/meta retained.
- [x] Phase 7: removed CSS-grid table markup.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR history 200 with table and pressed selector.
