# LIVE-01 / LIVE-02 — live sport hub and live-today index

**Purpose:** cross-sport live entry points that route users into each sport’s live hub.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | Correctness | Unknown sport renders a soft 200 “not found” instead of a real 404. | `live.$sport.tsx` |
| 2 | Medium | Copy | Page claims live matches load there while it only links to the sport hub. | `live.$sport.tsx` |
| 3 | Low | A11y | Raw slash breadcrumbs; links/CTAs under 44 px without focus rings. | both |
| 4 | Low | Tokens | Ad-hoc `rounded-lg` cards rather than the shared surface. | both |
| 5 | Low | SEO | No OG site name/Twitter meta. | both |

## Fix

1. `notFound()` for unknown sports with a shared 404 state.
2. Honest copy that points to the sport hub for live scores.
3. Labelled breadcrumbs, hidden separators, 44 px links/CTAs, focus rings.
4. Shared card surface.
5. Add meta tags.

## Phase checklist

- [x] Phase 1: real 404 for unknown sports.
- [x] Phase 2: layout kept.
- [x] Phase 3: shared card surface; 44 px CTA.
- [x] Phase 4: not-found state with route link.
- [x] Phase 5: labelled breadcrumb, hidden separators, 44 px links, focus rings.
- [x] Phase 6: OG site name/Twitter meta.
- [x] Phase 7: removed unreachable branch; honest copy.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR live/football 200, unknown sport 404.
