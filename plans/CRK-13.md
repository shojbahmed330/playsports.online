# CRK-13 — Cricket match detail

**Purpose:** follow one cricket match live: score, innings, scorecard, ball-by-ball commentary, match info and FAQs.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | SEO / data | Canonical drops the `leagueId` query. A match from a non-default league canonicalises to a URL that loads league 8048 and may show the wrong match or an error. | `cricket.match.$id.tsx` head |
| 2 | High | States | When the match is missing, the page prints the raw server `error` string and only has a “Back to cricket” link. | `cricket.match.$id.tsx` |
| 3 | Medium | States | `notFoundComponent` is a bare sentence with no nav, search or match-centre path. | route |
| 4 | Medium | SEO | No `og:image` for match pages; social cards fall back to the site default. | head |
| 5 | Low | A11y | Live score updates are not announced; live dot reduced-motion was fixed in the shared hero. | `MatchHero` |
| 6 | Low | Code | `useSearch` result is untyped/loosely typed; `leagueId` default is duplicated in the schema and canonical. | route |

## Keep

- SSR loader + suspense query with 10 s live refetch.
- Sticky bar, hero, tabs (Summary/Scorecard/Commentary/Info/FAQs), player sheet.
- SportsEvent + BreadcrumbList JSON-LD.
- Affiliate/ad slots below the content.

## Remove / simplify

- Raw error text in the empty state.
- Bare not-found component.

## Fix

1. Return `leagueId` from the loader and include it in the canonical only when it differs from the default (`8048`).
2. Replace the missing-match branch with `ErrorState` (retry) + a link to scores.
3. Branded not-found with links to cricket scores, series and home.
4. Add a generated OG image URL using the existing `/og/match/...` route if available; otherwise keep the default and note it.

## Add

- `aria-live="polite"` on the score region if the hero does not already provide it.
- 44 px not-found CTAs.

## New layout

1. Sport nav.
2. Sticky match bar (status, teams, score).
3. Match hero (teams, score, venue, status).
4. Tabs with counts.
5. Tab content; player sheet; FAQs.
6. Affiliate + ad.

## Responsive plan

- 360: hero stacks teams/score, tabs scroll horizontally, scorecard tables scroll.
- 768: full hero row, tabs fit.
- 1280: max-w-5xl, comfortable tables.

## Test plan

- Typecheck, tests, build.
- Direct match URL with `leagueId=8048` and a non-default league: canonical matches the requested league.
- Missing match: friendly error, retry calls refetch, CTA works.
- Live match: refetch every 10 s, no layout jump, score announced.
- Browser console: 0 hydration/errors.

## Phase checklist

- [x] Phase 1: canonical includes `leagueId` when non-default; missing-match shows friendly retry.
- [x] Phase 2: branded not-found with scores/hub CTAs; error branch layout.
- [x] Phase 3: shared state components and existing match tokens.
- [x] Phase 4: error/retry + not-found + score-data-unavailable states.
- [x] Phase 5: live score region `aria-live="polite"`; 44 px CTAs; reduced motion in hero.
- [x] Phase 6: canonical/JSON-LD preserved; `validateSearch` now uses `zodValidator`; global search serialisation fixed separately so match URLs are clean (`?leagueId=8043`, not `%228043%22`).
- [x] Phase 7: unknown error text removed; loader returns the validated league id.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; live match SSR has score + 5 tabs; canonical includes `?leagueId=8043`; browser 0 hydration/errors.
