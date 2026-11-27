# CRK-04 — Cricket hub

**Purpose:** show live cricket first, then today's fixtures, featured series and recent results, with one-tap paths to scores, series, teams, players and records.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Perf / SEO | Loader `prefetchQuery` does not block SSR; hero/pulse render empty and the client swaps in matches. | `cricket.index.tsx` loader |
| 2 | High | States | `q.data?.error` and `q.isError` are ignored; a feed failure leaves the page without an explanation or retry. | `cricket.index.tsx` |
| 3 | Medium | UI | Local `Section` duplicates Home's section header and uses four ad-hoc badge tone colours. | `cricket.index.tsx` |
| 4 | Medium | UI | Empty state is a hardcoded dashed `gray-800` box instead of the shared `EmptyState`. | `cricket.index.tsx` |
| 5 | Medium | A11y | Live dots use `animate-pulse` without reduced-motion; "All series"/"See all" links are 11–12 px text with small touch height. | cricket hub + `CricketMatchCard` |
| 6 | Low | Data | `buckets` returns an unused `now`; `Date.now()` is read outside the memo dependency list. | `cricket.index.tsx` |
| 7 | Low | Consistency | Mixed emerald/sky/amber link colours for the same "see all" action. | hub |
| 8 | Low | SEO | Good title/description/JSON-LD; no visible freshness stamp. | `cricket.index.tsx` |

## Keep

- Hero + live pulse + international block + featured series + live/today/upcoming/results sections.
- Auto-discovered series block.
- Curated league registry and IPL special case.

## Remove / simplify

- Remove the local `Section` component in favour of `SectionHeader`.
- Remove the hardcoded empty box.
- Remove the unused `now` field and stale comment noise.

## Fix

1. `ensureQueryData` for the cricket slate so SSR has matches.
2. Show `ErrorState` with Retry when the feed fails and no matches exist.
3. Show `EmptyState` when the feed is healthy but the window is empty.
4. Add reduced-motion to all live pulses.
5. Link actions get a 44 px tap target on mobile.

## New layout

1. Sport nav + cricket sub-nav.
2. Hero (live match or next match) + live pulse.
3. International cricket block (live/next).
4. Featured series tiles.
5. Auto-discovered active series.
6. Live right now → Today → Upcoming → Recent results.
7. Affiliate strip.

## Responsive plan

- 360: hero stacks; series tiles 2 columns; match cards 1 column; section action wraps under title.
- 768: 2-column match cards, 3-column series.
- 1280: 3-column matches, 5-column series; max width 7xl.

## Test plan

- Typecheck, tests, build.
- Dev SSR: HTML contains live/next cricket match and no "Loading cricket slate" when data is available.
- Browser: 0 hydration/console errors; live dot respects reduced motion; section links keyboard-focusable.
- Simulate feed error → `ErrorState` retry.
- Empty window → `EmptyState`.

## Phase checklist

- [x] Phase 1: `ensureQueryData` for the slate; errors now show a retry.
- [x] Phase 2: shared `SectionHeader`, token empty state, tighter section actions.
- [x] Phase 3: shared badge tones and live token; reduced arbitrary gray.
- [x] Phase 4: loading skeleton, shared empty state, error retry.
- [x] Phase 5: 44 px section links; reduced-motion live dots; responsive grids unchanged and verified.
- [x] Phase 6: SSR-visible matches; structured data retained; no new inputs/HTML injection.
- [x] Phase 7: removed the local `Section` markup, unused `now`, and the ad-hoc empty box.
- [x] Phase 8: typecheck 0, tests 27/27, build pass, dev SSR has "Live right now" with 16 match links, browser 0 hydration/errors.
