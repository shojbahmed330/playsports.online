# Blockers

## BLK-SYS-01 — Remaining route screens (resource blocker)

- **Screen IDs:** 69 route screens still `BLOCKED` in `SCREEN_INVENTORY.md` (plus the 10 GLB global items).
- **Error:** the autonomous per-screen loop (audit → plan → 8 phases → verify) could not complete for every screen in the available execution budget. The foundation and 81 route screens are complete; the rest have the shared foundation but no per-screen audit.
- **Tried:** router inventory; shared state components; global typecheck/audit/PWA/search/security fixes; 81 full screen passes; global football layout navigation; duplicate `main-content` cleanup.
- **Status:** BLOCKED (resource).
- **Resume:** finish the remaining MLB screens, then NBA/NHL/MLS and the global items, following `FINAL_REPORT.md`. No screen should be marked DONE without its own `plans/<ID>.md` and Phase 8 verification.

## Individual technical blockers

- **BLK-HYDRATION-01 — `DateScrubber` locale/UTC mix.** `src/components/football/DateScrubber.tsx` builds day keys with `toISOString()` (UTC) while displaying `getDate()` and locale month/weekday names; SSR and a far-from-UTC client can differ around midnight or month boundaries. Screen-level hydration fixes are in place, but the shared scrubber needs a dedicated deterministic-label pass. Affected screens remain DONE for their own scope; this is tracked as a global follow-up.
- `/news` remains empty because `match_recaps` has 0 rows; recap generation needs admin/OpenRouter input.

