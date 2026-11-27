# CRK-25 — cricket tournament profile

**Purpose:** static tournament landing page with champions, top run-scorers/wicket-takers, FAQs and related tournaments.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Error/not-found are bare centered text, no navigation or retry. | `cricket.tournaments.$slug.tsx` |
| 2 | Medium | A11y | Champions table lacks caption/`scope`; player links use ad-hoc slugging that differs from `slugify`. | table/players |
| 3 | Low | A11y | Main has no `id="main-content"`; CTA and related links are under 44 px. | layout |
| 4 | Low | UI | No branded empty state when a tournament has no history. | body |
| 5 | Low | SEO | Head lacks `og:site_name` and Twitter meta. | head |

## Keep

- SSR loader/notFound, static data, JSON-LD (org, breadcrumb, item list, FAQ).
- Champions table, top runs/wickets, FAQ, related tournaments.
- Live fixtures CTA to series detail.

## Fix

1. Shared error/not-found states with SportNav + CricketSubNav.
2. Table caption/`scope`; use the shared `slugify` for player links.
3. `main-content` id; 44 px CTA/related links.
4. Shared empty state when no champions/history.
5. Add OG site name and Twitter meta.

## Test plan

- Typecheck, tests, build.
- SSR tournament page 200 for a known slug with champions table.
- Unknown slug returns not-found state.
- Player links resolve to the profile route.

## Phase checklist

- [x] Phase 1: shared retryable error and not-found states with sport nav.
- [x] Phase 2: layout kept.
- [x] Phase 3: existing tokens kept.
- [x] Phase 4: shared empty state when no champions.
- [x] Phase 5: table caption/`scope`; shared `slugify` for player links; `main-content` id; 44 px CTA/related links.
- [x] Phase 6: OG site name + Twitter meta.
- [x] Phase 7: no dead code.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR ICC WC 200 with caption, unknown slug 404 with shared state.
