# Blockers

## BLK-SYS-01 — Remaining route screens (resource blocker)

- **Screen IDs:** all rows still `BLOCKED` in `SCREEN_INVENTORY.md` (144 route screens + 5 global items).
- **Error:** the autonomous per-screen loop (audit → plan → 8 phases → verify) could not complete for every screen in one session. The foundation, Home and the first five Cricket screens consumed the available execution budget. This is a session-capacity blocker, not a code failure.
- **Tried:** automated router inventory; shared state components; global typecheck/audit/PWA/search fixes; six full screen passes (HOME-01, CRK-04, CRK-19, CRK-13, CRK-21, CRK-24).
- **Status:** BLOCKED (resource).
- **Resume:** follow the order in `FINAL_REPORT.md` and update the status to IN-PROGRESS one screen at a time. No screen should be marked DONE without its own `plans/<ID>.md` and Phase 8 verification.

## Individual technical blockers

No individual screen has hit a reproducible technical blocker yet.
