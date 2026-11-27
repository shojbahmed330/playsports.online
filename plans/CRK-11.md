# CRK-11 — IPL team profile

**Purpose:** franchise profile with hero, season squad, fixtures, head-to-head and title history.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Squad fetch errors are ignored; no retry. | `cricket.ipl.teams.$teamId.tsx` |
| 2 | Medium | States | Error and not-found states are plain text; no shared components. | route |
| 3 | Medium | A11y | Season label is not associated; select is 28 px; tabs lack tab semantics/44 px height. | controls |
| 4 | Low | Motion | Hero shine and pulse ignore reduced motion; squad hover translates. | hero/cards |
| 5 | Low | UI | Four plain-text empty states duplicate the shared `EmptyState`. | tabs |
| 6 | Low | A11y | Timeline trophy emoji has no accessible label; icons lack `aria-hidden`. | overview |
| 7 | Low | SEO | Head lacks `og:type` and Twitter card meta. | head |

## Keep

- SSR team loader, not-found throw.
- Branded hero, captain timeline, season picker, five tabs.
- Squad grid, fixtures, H2H aggregation, titles list.
- Player sheet integration.

## Fix

1. Squad error state with Retry.
2. Shared `ErrorState` (with reset) and `EmptyState` not-found.
3. Associated season label, 44 px select, `tablist`/`tab` + `aria-selected`.
4. Reduced-motion guards.
5. Shared empty states in all four tabs.
6. Accessible trophy/count labels; hidden decorative icons.
7. Add OG/Twitter meta.

## Test plan

- Typecheck, tests, build.
- SSR team profile 200 for a real team id with hero, tabs and titles.
- Invalid id returns the not-found state.
- Squad error path reviewed.

## Phase checklist

- [x] Phase 1: squad Retry; branded error boundary; shared not-found state.
- [x] Phase 2: hero/section layout kept.
- [x] Phase 3: franchise tokens kept.
- [x] Phase 4: shared empty states in squad/titles/fixtures/H2H; squad error handled.
- [x] Phase 5: associated season label, 44 px select/tabs, `aria-pressed`, reduced motion, accessible trophy counts and hidden icons.
- [x] Phase 6: OG/Twitter meta added; JSON-LD retained.
- [x] Phase 7: removed duplicate local empty markup.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR CSK 200 and invalid id 404 with shared not-found state.
