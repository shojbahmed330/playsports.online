# Changelog

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
