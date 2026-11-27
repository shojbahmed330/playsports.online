# SRCH-01 — search

**Purpose:** fuzzy search over World Cup countries, players and tournaments.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Empty query and no-results states are ad-hoc paragraphs. | `search.tsx` |
| 2 | Medium | A11y | Search input has only a placeholder label; no submit button; results lack focus rings; flags are announced. | page |
| 3 | Low | Copy | Title implies all-sport search but the index only covers the World Cup archive. | head/h1 |
| 4 | Low | Tokens | One-off blue/indigo/purple gradient and hardcoded input colours. | header |
| 5 | Low | SEO | No OG site name. | head |

## Fix

1. Shared empty states for initial prompt and no results.
2. Label + submit button, hidden flags, 44 px controls, focus rings.
3. Scope copy to the World Cup archive.
4. Token-based header and input.
5. Add OG site name.

## Phase checklist

- [x] Phase 1: shared initial/no-results states.
- [x] Phase 2: layout kept.
- [x] Phase 3: token-based header/input.
- [x] Phase 4: empty states with guidance.
- [x] Phase 5: labelled input, submit button, hidden flags, 44 px controls, focus rings.
- [x] Phase 6: scope copy; OG site name; noindex retained.
- [x] Phase 7: result-kind labels cleaned.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR empty/result/no-result searches 200.
