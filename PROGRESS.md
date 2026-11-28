# Progress

Updated: 2026-11-28 (session 2 — redesign pass + production deploy)

- Branch: `professional-overhaul` (deployed via Vercel CLI, not pushed to GitHub)
- Current phase: **redesign wave complete (21 / 22 mandatory screens)**
- Current screen: final verification / PREM-01 owner decision
- Screens done: **150 / 150 route screens** (audit/fix)
- Redesign done: **21 / 22 mandatory** (HOME-01, FB-22, FB-30, PLYR-02, MINE-01 + 17 cricket screens)
- Global items done: **10 / 10 (GLB-01–GLB-10)**
- Blocked: **1 (PREM-01, pricing decision)**; 6 templates recommended, not mandatory
- Production: `www.playsports.online` — deployment `brrnr3bob` (2026-11-28)
- Screens in progress: 0

## Completed

- Step 1 baseline: `HEALTH_BASELINE.md`.
- Step 2 inventory: `SCREEN_INVENTORY.md` (150 route screens + 10 global/overlay items).
- Step 3 foundation: typecheck 59→0, audit 66→6, PWA deploy script, security headers, shared states, clean search URLs, reduced motion, Prettier line-ending fix.
- Screens:
  1. HOME-01 Home dashboard
  2. CRK-04 Cricket hub
  3. CRK-19 Cricket scores
  4. CRK-01–CRK-26 Cricket module
  5. FB-01–FB-34 Football module
  6. LIVE-01/02, NEWS-01/02, SRCH-01, AUTH-01, ADMIN-01
  7. UTIL-01–UTIL-07
  8. MLB-01–MLB-17
  9. NBA-01–NBA-15
  10. NHL-01–NHL-15
  11. MLS-01–MLS-15
  12. GUIDE-01–04 (guides + highlights)
  13. XSPT-01–05 (archive, team, player, H2H, tournament leaderboard/stage)
  14. MINE-01, PLYR-01/02, PREM-01
- Global items: GLB-01 root layout/404/error shell, GLB-02 desktop header + sport switcher, GLB-03 mobile tab bar + More sheet, GLB-04 footer, GLB-05 breadcrumbs, GLB-06 search page/entry points, GLB-07 player sheets, GLB-08 auth shell, GLB-09 SSR 404/500 shell, GLB-10 PWA worker + manifest.

## Not done (deliberately, needs owner or deploy)

- Push/deploy/PWA production verification (`/sw.js` verified only in build output).
- Premium price/checkout mismatch (owner decision).
- `DateScrubber` hydration determinism (BLK-HYDRATION-01).
- 6 remaining dependency advisories; Home bundle ~745 KB.
- `/news` has no recaps because `match_recaps` has 0 rows.
## Deployed to production (2026-11-28)

- Vercel project: `allsportslive-878f2a0c` (production URL `https://www.playsports.online`).
- Preview deployment verified (200s, 404, SW headers), then promoted.
- Production deployment `p1zhpdq2a` Ready; `www` now serves the new build.
- Live checks: `/` 200 (one header, one h1), `/football` 200 (new `aria-pressed` subnav), `/search` 200, `/no-such-page` 404 branded, `/sw.js` 200 with `Service-Worker-Allowed: /`, manifest with `id` + `shortcuts`.
- CLI auth: `shojbahmed330`; `.env.local` is gitignored and was not committed.
