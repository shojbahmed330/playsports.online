# CRK-07 — IPL players

**Purpose:** Orange Cap / Purple Cap leaders plus the season six-hitting leaderboard.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Leaderboard errors are ignored; no retry. | `cricket.ipl.players.tsx` |
| 2 | Medium | States | Loader failure has no branded error boundary. | route |
| 3 | Medium | A11y | Season select has no label and is under 44 px. | header |
| 4 | Low | Copy | “Most sixes — this season” is wrong when a historic season is selected. | body |
| 5 | Low | UI | Local empty box duplicates the shared `EmptyState`. | sixes |
| 6 | Low | SEO | No CollectionPage JSON-LD. | head |

## Keep

- SSR ensure for runs/wickets/sixes/history.
- Orange/Purple cap cards with historical fallback.
- Six-hitting table and player links.

## Fix

1. One retry banner when any leaderboard fails, refetching all three.
2. Branded error boundary with retry.
3. Labelled 44 px season select.
4. Season-aware sixes heading.
5. Shared empty state.
6. CollectionPage JSON-LD.

## Test plan

- Typecheck, tests, build.
- SSR IPL players 200 with cap cards and season label.
- Season change updates URL and headings.
- Empty/error paths reviewed.

## Phase checklist

- [x] Phase 1: shared retry banner for all leaderboards; branded error boundary.
- [x] Phase 2: season-aware sixes heading.
- [x] Phase 3: existing IPL tokens kept.
- [x] Phase 4: shared empty state; error paths handled.
- [x] Phase 5: labelled 44 px season select.
- [x] Phase 6: CollectionPage JSON-LD; SSR retained.
- [x] Phase 7: removed local empty box.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR IPL players 200 with season label and CollectionPage.
