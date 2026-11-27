# Blockers

## BLK-SYS-01 — Remaining route screens (resource blocker)

- **Screen IDs:** 0 route screens remain `BLOCKED`; all 150 route screens are DONE.
- **Global items:** GLB-01–GLB-10 remain `BLOCKED` for a dedicated global layout/header/footer/PWA pass.
- **Status:** route-screen mission complete; global-item pass BLOCKED (resource).
- **Resume:** GLB-01–GLB-10, then the final cross-screen consistency + Lighthouse pass. No item should be marked DONE without evidence.

## Individual technical blockers

- **BLK-HYDRATION-01 — `DateScrubber` locale/UTC mix.** `src/components/football/DateScrubber.tsx` builds day keys with `toISOString()` (UTC) while displaying `getDate()` and locale month/weekday names; SSR and a far-from-UTC client can differ around midnight or month boundaries. Screen-level hydration fixes are in place, but the shared scrubber needs a dedicated deterministic-label pass. Affected screens remain DONE for their own scope; this is tracked as a global follow-up.
- `/news` remains empty because `match_recaps` has 0 rows; recap generation needs admin/OpenRouter input.

