# CRK-12 — IPL teams index

**Purpose:** list every IPL franchise with captain, coach, founded, titles and home ground.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Loader failure has no branded error boundary. | `cricket.ipl.teams.index.tsx` |
| 2 | Low | States | No empty state if the team list is empty. | body |
| 3 | Low | A11y | Cards lack a visible focus ring; trophy emoji is read without context. | cards |
| 4 | Low | Motion | Hover translate ignores reduced motion. | cards |
| 5 | Low | SEO | Only breadcrumb JSON-LD; no CollectionPage. | head |
| 6 | Low | Copy | Meta description hardcodes “ten” franchises. | head |

## Keep

- SSR teams loader, 1 h cache.
- Team gradient cards with crest, stats and title years.
- Sort by titles then name.

## Fix

1. Branded error boundary with retry.
2. Shared empty state.
3. `focus-visible` ring on cards; accessible title-history label.
4. `motion-reduce` guard.
5. CollectionPage JSON-LD.
6. Remove the hardcoded count from meta copy.

## Test plan

- Typecheck, tests, build.
- SSR teams page 200 with 10 franchise links.
- Card link resolves to a team profile.
- Empty/error code paths reviewed.

## Phase checklist

- [x] Phase 1: branded error boundary with retry; shared empty state.
- [x] Phase 2: card grid kept.
- [x] Phase 3: existing IPL gradient tokens kept.
- [x] Phase 4: empty/error paths handled.
- [x] Phase 5: focus-visible ring, accessible title history, reduced motion.
- [x] Phase 6: CollectionPage JSON-LD; meta copy no longer hardcodes ten teams.
- [x] Phase 7: removed stray blank lines.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR teams 200 with 10 team links and CollectionPage.
