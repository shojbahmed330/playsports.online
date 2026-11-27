# CRK-22 — cricket team history

**Purpose:** programmatic trophy-history page for a national/franchise cricket team.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Navigation | Page renders no site header or cricket sub-nav at all. | `cricket.team-history.$slug.tsx` |
| 2 | Medium | Layout | Content has no page width/padding container; it relies on the bare root wrapper. | body |
| 3 | Medium | States | Not-found is a bare dashed box with no header/back action. | route |
| 4 | Low | A11y | Header/history links are under 44 px; hardcoded `text-white` bypasses tokens. | links/header |
| 5 | Low | SEO | No OG site name/Twitter meta; no route error boundary. | head/route |

## Keep

- SSR loader/not-found, trophy/runner-up lists, related links and FAQ/breadcrumb JSON-LD.

## Fix

1. Add `SportNav` + `CricketSubNav`.
2. Constrain content with a padded max-width `main`.
3. Shared not-found/error states with a back action.
4. 44 px links; foreground/muted tokens.
5. Add OG site name/Twitter meta and an error boundary.

## Test plan

- Typecheck, tests, build.
- SSR team-history page 200 with header/nav and trophy lists.
- Unknown slug shows the shared not-found state.

## Phase checklist

- [x] Phase 1: `SportNav` + `CricketSubNav` + padded `main` added.
- [x] Phase 2: header/list layout kept.
- [x] Phase 3: foreground/muted tokens replace hardcoded white.
- [x] Phase 4: shared not-found/empty/error states with back actions.
- [x] Phase 5: 44 px navigation links.
- [x] Phase 6: OG site name/Twitter meta added; JSON-LD retained.
- [x] Phase 7: route error boundary added.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR India history 200 with nav, unknown slug 404 with shared state.
