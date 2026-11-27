# Blockers

## BLK-SYS-01 — Remaining route screens (resource blocker)

- **Screen IDs:** 110 route screens still `BLOCKED` in `SCREEN_INVENTORY.md` (plus 5 global items).
- **Error:** the autonomous per-screen loop (audit → plan → 8 phases → verify) could not complete for every screen in the available execution budget. The foundation and 40 route screens are complete; the rest have the shared foundation but no per-screen audit.
- **Tried:** router inventory; shared state components; global typecheck/audit/PWA/search/security fixes; 40 full screen passes; global football layout navigation; duplicate `main-content` cleanup.
- **Status:** BLOCKED (resource).
- **Resume:** start with FB-22 (football hub), FB-05 ($comp overview) and FB-01 (fixtures), then follow `FINAL_REPORT.md`. No screen should be marked DONE without its own `plans/<ID>.md` and Phase 8 verification.

## Individual technical blockers

- None reproducible. `/news` remains empty because `match_recaps` has 0 rows; recap generation needs admin/OpenRouter input.

