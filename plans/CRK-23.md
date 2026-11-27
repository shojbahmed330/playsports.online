# CRK-23 — Cricket team profile

**Purpose:** give one cricket team (international or IPL franchise) a trustworthy profile: ranking/franchise facts, FAQs and links to related entities.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Data / copy | International-team fallback FAQ says “X represents X in international cricket venues”, which is meaningless, and implies a home ground that is not recorded. | `cricket.teams.$slug.tsx` |
| 2 | Medium | States | Error is a bare sentence with no navigation; not-found only has a back link. | route |
| 3 | Medium | SEO | No `og:image` / Twitter card for team pages. | head |
| 4 | Medium | Internal linking | Profile has no path to team history, rankings, series or players. | body |
| 5 | Low | A11y | Related-team chips are ~34 px tall; logo alt is empty (acceptable for decorative crests). | body |
| 6 | Low | UI | Related chips and ranking cards use one-off spacing/typography. | body |

## Keep

- SSR loader and 404 on unknown slug.
- SportsTeam + BreadcrumbList + FAQPage JSON-LD.
- IPL franchise facts and ICC ranking cards.
- Cached AI FAQs with static fallback.
- Related international/franchise teams.

## Fix

1. Replace the nonsense fallback answer with an honest statement.
2. Branded ErrorState/EmptyState with cricket/team CTAs.
3. Add OG image (team logo or site default) and Twitter tags.
4. Add an Explore row: team history, rankings, series, players.
5. 44 px related chips.

## Test plan

- Typecheck, tests, build.
- SSR profile contains title, facts/rankings, FAQ.
- Unknown slug shows branded not-found with CTAs.
- Browser/console 0 hydration/errors.
- Explore links resolve to real routes.

## Phase checklist

- [x] Phase 1: fixed the international home-ground FAQ copy.
- [x] Phase 2: added Explore (team history, rankings, series, players).
- [x] Phase 3: token borders/cards and consistent link heights.
- [x] Phase 4: branded ErrorState with reset + not-found with two CTAs.
- [x] Phase 5: 44 px related/explore links.
- [x] Phase 6: OG image + Twitter tags.
- [x] Phase 7: removed the bare error/not-found markup.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR team page 200 with Explore/OG; team-history link 200. Browser hydration check unavailable (browser tool removed mid-session).
