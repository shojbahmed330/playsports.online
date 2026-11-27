# CRK-14 — Cricket player profile

**Purpose:** give one cricketer a trustworthy profile: career records, FAQs and related players.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | Data / copy | The country FAQ prints “represents null” when `player.country` is missing. | `cricket.players.$slug.tsx` |
| 2 | Medium | States | Error/not-found are bare sentences with no navigation. | route |
| 3 | Medium | SEO | No `og:image` / Twitter card. | head |
| 4 | Medium | Empty state | A player with zero records gets an empty table with no explanation. | records |
| 5 | Medium | Internal linking | No path to rankings, records, teams or the player index. | body |
| 6 | Low | A11y | Related chips are ~34 px; table has no caption. | body |

## Keep

- SSR loader, 404 on unknown slug.
- Athlete + BreadcrumbList + FAQPage JSON-LD.
- Career records table and related players.
- Cached AI FAQs with static fallback.

## Fix

1. Guard the country FAQ (generic wording when unknown).
2. Branded ErrorState/EmptyState with CTAs.
3. OG image + Twitter tags.
4. Empty records state.
5. Explore links + 44 px related chips + table caption.

## Test plan

- Typecheck, tests, build.
- SSR profile 200 with career records and FAQs.
- Unknown slug shows branded not-found.
- Empty records state (if a player has none).
- No console errors (browser tool unavailable; SSR checked).

## Phase checklist

- [x] Phase 1: guarded the country FAQ; replaced bare error/not-found.
- [x] Phase 2: Explore links (rankings/records/teams/players); player index now links to profiles.
- [x] Phase 3: token labels, branded states.
- [x] Phase 4: empty-records state; error/not-found with CTAs.
- [x] Phase 5: 44 px related/profile links; table caption and `scope`.
- [x] Phase 6: OG image + Twitter tags.
- [x] Phase 7: removed misleading null copy.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR profile 200 with records/Explore/OG; index exposes 11 profile links.
