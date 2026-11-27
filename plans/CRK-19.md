# CRK-19 — Cricket scores

**Purpose:** one place to scan live cricket, today's fixtures, upcoming matches and results, filtered by series, format and date.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Perf / SEO | No route loader; the first paint is a skeleton and all scores are client-fetched. | `cricket.scores.tsx` |
| 2 | High | States | Only loading and empty; a failed feed has no error or retry. | `cricket.scores.tsx` |
| 3 | High | Bug / data | Every series header links to `/cricket/series/$id`; matches with an empty or `global` league id produce a dead link. | `cricket.scores.tsx` |
| 4 | Medium | Hydration | Date strip and "today" are built from the server's local timezone; adding SSR would mismatch the user's day. | `buildDateStrip`, `effectiveDate` |
| 5 | Medium | A11y | Filter chips/date buttons are 28–32 px tall and text-only; below the 44 px touch target. | filters/date strip |
| 6 | Low | UI | Empty state is a hardcoded dashed `gray-800` box. | scores body |
| 7 | Low | A11y | "Updating…" pulse ignores reduced motion. | header |
| 8 | Low | Code | Repeats the same long search type in every `navigate` callback. | filters |

## Keep

- Tabs: Live / Today / Upcoming / Results.
- Date strip for Today/Upcoming.
- Series + format filters.
- Group-by-series layout and match cards.
- Canonical/JSON-LD and default query stripping.

## Remove / simplify

- Dead "Series page" link when the league id is missing.
- Repeated inline search object types (use `ScoresSearch`).
- Hardcoded empty box.

## Fix

1. `ensureQueryData` loader so the live tab is in the SSR HTML.
2. `ErrorState` with Retry when the query fails.
3. Hydration-safe local "today": compute it after mount; date strip renders only then; server renders the live tab.
4. Hide the series link unless the league id is a real series id.
5. Shared `EmptyState`.

## Add

- 44 px filter/date targets.
- Reduced-motion on the updating pulse.

## New layout

1. Sport nav + cricket sub-nav.
2. Header with “Cricket scores”, live-updating indicator.
3. Tabs with counts.
4. Date strip (today/upcoming) + previous/next day.
5. Series and format filters in one scrollable row.
6. Grouped match cards by series, each with a series link.

## Responsive plan

- 360: filters scroll horizontally; date strip scrolls; cards 1 column.
- 768: cards 2 columns; filters wrap.
- 1280: cards 3 columns; date strip fits without scroll.

## Test plan

- Typecheck, tests, build.
- SSR `/cricket/scores` contains live/upcoming match text.
- Direct `/cricket/scores?tab=today` hydrates with 0 mismatch.
- Fail feed → ErrorState retry.
- Empty filter → EmptyState with reset CTA.
- Keyboard/focus and 44 px targets.

## Phase checklist

- [x] Phase 1: `ensureQueryData` loader; `ErrorState` retry; hidden dead series links.
- [x] Phase 2: header/tabs/date/filter hierarchy preserved and tightened.
- [x] Phase 3: tab/format chips use token surfaces; series count uses muted foreground.
- [x] Phase 4: loading skeleton, shared empty state with Reset filters, error retry.
- [x] Phase 5: local “today” is computed after mount; date strip waits for it; date/arrow/filter targets are 44 px; reducing motion respected.
- [x] Phase 6: live tab is SSR-rendered with match links; canonical/JSON-LD retained.
- [x] Phase 7: dead link removed and repeated inline search types removed from the changed callbacks.
- [x] Phase 8: typecheck 0, tests 27/27, build pass, SSR has 2 live match links, browser 0 hydration/errors on live and today tabs.
