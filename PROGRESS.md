# Progress

Updated: 2026-11-28 (session 2 — redesign pass + production deploy)

- Branch: `professional-overhaul` (deployed via Vercel CLI, not pushed to GitHub)
- Current phase: **redesign wave complete (21 / 22 mandatory screens)**
- Current screen: final verification / PREM-01 owner decision
- Screens done: **150 / 150 route screens** (audit/fix)
- Redesign done: **22 / 22 mandatory screens** (HOME-01, FB-22, FB-30, PLYR-02, MINE-01, PREM-01 + 17 cricket screens)
- Global items done: **10 / 10 (GLB-01–GLB-10)**
- Blocked: **0 screens**; PREM-01 pricing/checkout is an open owner decision (visual pass shipped, billing unchanged)
- Production: `www.playsports.online` — latest deployment promoted and verified (2026-11-28)
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

## Remaining owner/data items

- Premium price/checkout mismatch (owner decision); the page visuals are done.
- 6 remaining dependency advisories (semver-major); Home bundle ~745 KB.
- `/news` has no recaps because `match_recaps` has 0 rows.
- Pushing this branch to GitHub needs credentials for `shojbahmed330` (local git is authenticated as `shojibahmed24`, which gets 403).

## Deployed to production (2026-11-28)

- Vercel project: `allsportslive-878f2a0c` (production URL `https://www.playsports.online`).
- Latest deployment promoted and verified after the encoding repair; `www` serves the clean build.
- Live checks: `/` 200, `/football` 200, `/cricket` 200, `/players` 200, `/premium` 200, player profiles 200 (Devdutt Padikkal, KL Rahul, Pat Cummins), `/no-such-page` 404 branded, `/sw.js` 200 with `Service-Worker-Allowed: /`, manifest with `id` + `shortcuts`.
- Production HTML verified: no mojibake, correct em dashes, flag rendered as an image, no raw ESPN URL text.
- CLI auth: `shojbahmed330`; `.env.local` is gitignored and was not committed.

## News section (2026-11-28)

- `/news` was fully built but served an empty state because `match_recaps` had 0 rows.
- Added a protected generator at `POST/GET /api/public/news-generate` (header `x-news-secret`, env `NEWS_ADMIN_SECRET`). It generates one AI recap per call and upserts it, so it stays inside the serverless timeout.
- Free-tier provider returned HTTP 429 during the first seed run, so AI seeding is optional/deferred. `/news` no longer depends on it.
- Added `src/lib/news-auto.server.ts`: 20 deterministic, data-grounded recaps built from the same archive rows. `/news`, `/news/$slug`, RSS and `sitemap-news.xml` are populated without AI or DB writes; DB rows take precedence when they exist.
- Added `src/lib/news-live.server.ts`: recent completed matches from ESPN (top football leagues + current cricket series) appear as `current-...` recaps with direct match links, cached 10 minutes. Current results lead the page; archive recaps follow.
- Curated 20 seed matches: 8 notable World Cup group matches + 12 cricket finals/classics.
- Extracted the AI prompt + upsert into `src/lib/match-recaps.generate.server.ts`; the admin server functions use the same code.

## Final hardening

- 2026 leaderboard URL collision fixed: the stage route now serves known leaderboard slugs itself (empty state + all-time links) instead of letting them 404.
- Removed the unused `satori` dependency and ran `bun audit fix` (seroval). Advisories: 6 -> 3 (zod 3 build-time path, glob/minimatch dev tooling).
- Tested vendor `manualChunks`; it regressed the entry chunk to ~2.2 MB, so it was reverted. Entry stays ~587 KB raw (Vercel compresses it).
- Branch pushed: `origin/professional-overhaul`.

## P1 audit fixes (2026-11-28)

- Live player clean URLs now resolve for known name mismatches (`kannaur-lokesh` → athlete `422108`). Canonical is the clean URL when it resolves; otherwise it carries `?athlete=<id>` so it never points at a 404.
- Player profile TTFB cut from ~9 s to ~0.4–0.7 s: the loader fetches the bio only, career stats load client-side with a skeleton, and successful Statsguru tables persist in the existing `sports_data_cache` for 7 days (plus 24 h memory).
- `/news` now separates **Latest results** from **From the archive**; aged-out `current-...` URLs 307-redirect to `/news` instead of 404ing.
- Empty 2026 leaderboard pages are `noindex,follow` (no thin-content indexing).
- Long player names wrap instead of truncating on mobile.
- `NEWS_ADMIN_SECRET` rotated; the generator returns 401 without the new secret.

## Dependency + bundle pass (2026-11-28)

- Replaced `@tanstack/zod-adapter` (zod 3 peer) with `src/lib/zod-validator.ts` on zod 4; pinned `zod`, `minimatch` and `glob` via `package.json` overrides. `bun audit`: **0 vulnerabilities**. Vercel/npm compatibility fixed with `$zod`.
- `manualChunks` now splits react (178 KB), radix (106 KB) and icons (32 KB) from the entry; entry dropped from ~587 KB to **~401 KB** raw.
- Browser check found an open React #418 text hydration mismatch on `/` and `/cricket` (pages render); logged as BLK-HYDRATION-02.
