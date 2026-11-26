# HOME-01 — Home dashboard

**Purpose:** give a returning fan the single most important live/next match in one glance, then a fast path into cricket, football and the other sports.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Perf / SEO | Loader used `prefetchQuery` for the two hero feeds, so SSR rendered `EmptyHero` and the client swapped in a live match — layout shift and no live content in the HTML. | `src/routes/index.tsx` loader |
| 2 | High | Bug / states | A failed ESPN + WC feed silently removed every section; no error or retry. | `src/routes/index.tsx` |
| 3 | Medium | UI | Duplicate/overlapping live modules: For You strip, Pulse strip and Live grid all repeat the same games. Kept for now (different densities) but the page order is heavy. | Home sections |
| 4 | Medium | Code | Page is a single 430+ line component with a local `Section` helper and ad-hoc badge colours. | `src/routes/index.tsx` |
| 5 | Medium | A11y | `animate-pulse`/`animate-ping` live dots ignore reduced motion; small icon-only controls rely on hover. | Home components |
| 6 | Medium | Perf | 745 KB `index` JS chunk pulls every home widget eagerly, including below-fold affiliate/newsletter components. | bundle |
| 7 | Low | UI | Hardcoded `gray-*`/`red-*` classes instead of `--live` / surface tokens in several home strips. | Home components |
| 8 | Low | SEO | Home has WebSite/Organization JSON-LD from root but no visible freshness signal. | `__root.tsx` |

## Keep

- Compact, now-first hero logic (live ESPN → live WC → upcoming).
- Sticky sport chips with live counts.
- Cricket slate and football slate as the two main sport doors.
- "Choose a sport" league cards.
- Newsletter and affiliate modules, but below the editorial content.

## Remove / simplify

- Remove the mounted-gate around hero/ticker (replaced by SSR data).
- Remove the double condition `(!mounted && !liveQ.data) || liveQ.isLoading`.
- Keep ForYou/Pulse/Live for now; merge in a later consistency pass if they still duplicate.

## Fix

1. Await `ensureQueryData` for the hero feeds so SSR and hydration match.
2. Render a friendly `ErrorState` with Retry when both feeds fail.
3. Remove the `mounted` state and its unused `useEffect`.
4. Replace the loading condition with `!liveQ.data && liveQ.isLoading`.

## Add

- Shared `ErrorState` component.
- SSR-complete hero/ticker.
- (Later) `SectionHeader` adoption across home sections.

## New layout (top → bottom)

1. Header + true live count.
2. Live ticker (only when live).
3. One compact hero: the most important match.
4. Status line: live/upcoming/today + timezone.
5. Sticky sport chips.
6. Error/retry banner when feeds fail.
7. For You (3 quick cards), Pulse strip, Live grid.
8. Today in your zone, football slate, cricket slate.
9. Upcoming + recent finals (progressive disclosure).
10. Sport doors, Hall of Champions, partner strip, popular searches, newsletter.

## Responsive plan

- 360–430: hero stacks score/teams; chips scroll horizontally; grids 1 column; touch targets ≥44 px.
- 640–1024: 2-column cards; ticker visible; sport doors 3 columns.
- ≥1280: 6-column sport doors; hero max-width 6xl; grid 3 columns.

## Test plan

- `bun run typecheck`, `bun run test`, `bun run build`.
- Dev server: `/` HTML contains the hero match (not `EmptyHero`) when feeds return data.
- Browser console: 0 hydration errors, 0 uncaught errors.
- Simulate feed failure (block ESPN/WC network) → `ErrorState` with working Retry.
- Check `prefers-reduced-motion` for live pulses.
- Verify no layout shift between SSR and hydration.

## Phase checklist

- [x] Phase 1: SSR data + error retry + remove mounted gate.
- [ ] Phase 2: section hierarchy and duplicate live modules.
- [ ] Phase 3: token/typography consistency.
- [ ] Phase 4: reduced-motion + loaded/empty states on every strip.
- [ ] Phase 5: responsive QA 360/768/1280.
- [ ] Phase 6: lazy-load below-fold widgets, image/CLS pass.
- [ ] Phase 7: split page into sections; remove dead imports.
- [ ] Phase 8: verify + update inventory/changelog.
