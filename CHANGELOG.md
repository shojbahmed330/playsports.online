# Changelog

## HOME-01 Home dashboard

- Kept: compact now-first hero, live ticker, sport chips, cricket/football slates, sport doors, newsletter.
- Removed: mounted hero gate, unused effect, duplicate loading condition.
- Fixed: SSR now awaits hero feeds (`ensureQueryData`) so the hero/ticker/counts are in the HTML; feed failure shows `ErrorState` with Retry; live dot no longer causes a hydration attribute mismatch.
- Added: shared `SectionHeader`, token-based live colour, reduced-motion support.
- Deferred: JS chunk splitting and merging ForYou/Pulse/Live.

## CRK-04 Cricket hub

- Kept: hero, live pulse, international block, featured series, auto-discovered series, live/today/upcoming/results.
- Removed: local `Section` markup, hardcoded empty box, unused `now` field.
- Fixed: SSR slate (`ensureQueryData`), feed error + Retry, shared empty state, 44 px “See all” links, reduced-motion live dots.

## CRK-19 Cricket scores

- Fixed: SSR live tab, error retry, dead series links, hydration-safe local today, 44 px filters/date buttons, reduced motion.
- Added: shared empty state with Reset filters.
- Kept: tabs, date strip, series/format filters, grouped match cards, canonical.

## CRK-13 Cricket match detail

- Fixed: canonical keeps non-default `leagueId`; missing match no longer prints raw server errors; branded not-found; live score region announced; 44 px CTAs.
- Added: validated search via `zodValidator`, friendly retry state.
- Global: cleaned search URLs (`?leagueId=8043` instead of `%228043%22`) while accepting old links.

## CRK-21 Cricket series hub

- Fixed: curated series SSR, error/retry states, 44 px filters, reduced-motion dots, polling only when live.
- Added: shared loading/empty states; bilateral tours no longer dehydrate on SSR (hydration-safe).
- Kept: bilateral block, format/type filters, series cards, canonical.

## CRK-24 Cricket teams

- Fixed: team cards now open the team profile when one exists (series fallback otherwise), instead of always opening a series.
- Added: SSR team lists, all-error + partial-error states, shared empty state, labelled search, 44 px chips, reduced-motion skeleton.
- Kept: league filters, crests, dedupe across leagues.

## Foundation

- Added overhaul documentation: `PROJECT_NOTES.md`, `HEALTH_BASELINE.md`, `SCREEN_INVENTORY.md`, `DESIGN_SYSTEM.md`, `PROGRESS.md`, `DECISIONS.md`, `BLOCKERS.md`, `SECURITY_FINDINGS.md`.
- Baseline: build pass, 24/24 tests pass, typecheck 59 errors, lint 84k problems, 66 dependency vulnerabilities.
- Fixed typecheck to **0 errors** (unknown error values, search param casts, typed dynamic links, root error boundary).
- Added Prettier `endOfLine: auto` to stop CRLF false positives.
- `bun audit fix`: 66 → 6 vulnerabilities (3 critical → 0 critical).
- Fixed PWA deploy: `scripts/postbuild-pwa.mjs` copies `sw.js`/workbox into Nitro output; `bun run build` runs it.
- Added security headers and SW cache headers in `vercel.json`.
- Added shared states `EmptyState`, `ErrorState`, `LoadingState`, `SectionHeader`, `InlineSpinner` in `src/components/ui/state.tsx`.
- Added `errorMessage()` helper + tests; tests now 27/27.
- Fixed a rules-of-hooks violation on the cross-sport team page.
