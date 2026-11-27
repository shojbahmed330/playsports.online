# CRK-21 — Cricket series hub

**Purpose:** browse every tracked cricket series/tour, see which are live, and jump into fixtures and standings.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Perf / SEO | The loader uses `prefetchQuery` for both feeds, so the SSR shell has no series cards. | `cricket.series.index.tsx` |
| 2 | High | States | Curated-list and bilateral-tour errors are ignored; an error looks like “no series match your filters”. | route |
| 3 | High | Perf | Both feeds refetch every 60 s even when nothing is live; the bilateral builder is expensive. | query options |
| 4 | Medium | A11y | Filter chips are ~24 px tall and the “Live & fixtures” link is tiny. | chips/link |
| 5 | Low | UI | Empty state is a hardcoded dashed box. | body |
| 6 | Low | A11y | Live pulses ignore reduced motion. | cards |
| 7 | Low | Consistency | Gray-500 labels instead of muted tokens. | filters |

## Keep

- Hero with series count.
- Bilateral tours block (top 9).
- Format/type filters.
- Series cards with live/upcoming/finished counts.
- Curated + catalogue data.

## Remove / simplify

- Hardcoded empty box.
- Unconditional 60 s polling.

## Fix

1. `ensureQueryData` for the fast curated list; keep the heavy bilateral list as a background prefetch.
2. Error state for the curated list with Retry; small inline retry if bilateral tours fail.
3. Shared empty state.
4. 44 px filter chips and CTA.
5. Reduced-motion live dots.
6. Refetch only when a curated series is live.

## Add

- Skeleton for bilateral tours while loading (does not block the page).

## New layout

1. Sport nav + sub-nav.
2. Hero (“All Series”, count).
3. Bilateral tours (9 cards) or inline retry.
4. Format/type filters.
5. Series grid.
6. Empty/error states.

## Responsive plan

- 360: one column; filters wrap; chips 44 px.
- 768: two columns.
- 1280: three columns; max width 7xl.

## Test plan

- Typecheck, tests, build.
- SSR contains curated series cards.
- Fail curated feed → ErrorState retry.
- Empty filter → EmptyState with reset.
- Browser 0 hydration/errors; reduced motion respected.

## Phase checklist

- [x] Phase 1: curated list SSR; error retry for the list and inline retry for tours.
- [x] Phase 2: shared empty/loading states; filter layout preserved.
- [x] Phase 3: token labels, badge tones.
- [x] Phase 4: loading, empty with Clear filters, curated error, tours retry.
- [x] Phase 5: 44 px chips and CTA; reduced-motion live dots.
- [x] Phase 6: polling only when live; heavy bilateral list no longer dehydrates on SSR (prevents hydration mismatch).
- [x] Phase 7: removed hardcoded empty box and unconditional polling.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR has 9 series links, browser 18 links, Bilateral Tours, 0 hydration/errors.
